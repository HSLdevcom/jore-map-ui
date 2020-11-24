import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Dropdown } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import Loader from '~/components/shared/loader/Loader';
import { ILineHeader } from '~/models';
import { ISearchLine } from '~/models/ILine';
import LineHeaderService from '~/services/lineHeaderService';
import LineService from '~/services/lineService';
import { LineHeaderMassEditStore } from '~/stores/lineHeaderMassEditStore';
import { LineStore } from '~/stores/lineStore';
import { toDateString } from '~/utils/dateUtils';
import { createDropdownItemsFromList } from '~/utils/dropdownUtils';
import SidebarHeader from '../SidebarHeader';
import * as s from './searchLineHeadersToCopy.scss';

interface ISearchLineHeadersToCopyProps {
    closeLineHeadersCopyView: Function;
    scrollToTheBottomOfLineView: Function;
    lineStore?: LineStore;
}

const SearchLineHeadersToCopy = inject('lineStore')(
    observer((props: ISearchLineHeadersToCopyProps) => {
        const [isLoadingLines, setIsLoadingLines] = useState<boolean>(true);
        const [areInactiveLinesHidden, setAreInactiveLinesHidden] = useState<boolean>(true);
        const [selectedLineId, setSelectedLineId] = useState<string>('');
        const [lineDropdownItems, setLineDropdownItems] = useState<IDropdownItem[]>([]);
        const [isLoadingLineHeaders, setIsLoadingLineHeaders] = useState<boolean>(true);
        const [lineHeaders, setLineHeaders] = useState<ILineHeader[]>([]);

        useEffect(() => {
            const fetchLineDropdownItems = async () => {
                setIsLoadingLines(true);
                let lineQueryResult: ISearchLine[] = (
                    await LineService.fetchAllSearchLines()
                ).filter((l) => l.transitType === props.lineStore!.line!.transitType!);
                if (areInactiveLinesHidden) {
                    lineQueryResult = lineQueryResult.filter((line) => {
                        let isLineActive = false;
                        line.routes.forEach((route) => {
                            if (route.isUsedByRoutePath) {
                                isLineActive = true;
                                return;
                            }
                        });
                        return isLineActive;
                    });
                }
                const lineDropdownItems = createDropdownItemsFromList(
                    lineQueryResult.map((searchLine) => searchLine.id)
                );
                setLineDropdownItems(lineDropdownItems);
                setIsLoadingLines(false);
            };
            fetchLineDropdownItems();
        }, [props.lineStore!.line!.transitType!, areInactiveLinesHidden]);

        useEffect(() => {
            const fetchLineHeaders = async () => {
                setIsLoadingLineHeaders(true);
                const lineHeaders = await LineHeaderService.fetchLineHeaders(selectedLineId);
                setLineHeaders(lineHeaders);
                setIsLoadingLineHeaders(false);
            };
            fetchLineHeaders();
        }, [selectedLineId]);

        useEffect(() => {
            // When loading the component for the first time, we want to scroll to the bottom of the page
            props.scrollToTheBottomOfLineView();
        }, []);

        return (
            <div className={s.searchLineHeadersCopy}>
                {isLoadingLines ? (
                    <Loader />
                ) : (
                    <>
                        <SidebarHeader
                            isEditPromptHidden={true}
                            isCloseButtonVisible={true}
                            onCloseButtonClick={() => props.closeLineHeadersCopyView()}
                        >
                            <div>Etsi kopioitavia linjan otsikoita</div>
                        </SidebarHeader>
                        <div className={classnames(s.form, s.lineHeadersToCopyForm)}>
                            <div className={s.flexRow}>
                                <Checkbox
                                    content='Näytä vain aktiiviset linjat'
                                    checked={areInactiveLinesHidden}
                                    onClick={() =>
                                        setAreInactiveLinesHidden(!areInactiveLinesHidden)
                                    }
                                />
                            </div>
                            <div className={s.flexRow}>
                                <Dropdown
                                    label='LINJA'
                                    selected={selectedLineId}
                                    items={lineDropdownItems}
                                    onChange={(newLineId) => setSelectedLineId(newLineId)}
                                    validationResult={
                                        selectedLineId.length === 0
                                            ? { isValid: false, errorMessage: 'Valitse linja' }
                                            : undefined
                                    }
                                    data-cy='lineDropdown'
                                />
                            </div>
                            <div className={s.flexRow}>
                                {isLoadingLineHeaders ? (
                                    <Loader />
                                ) : (
                                    <LineHeaderTable
                                        lineHeaders={lineHeaders}
                                        selectedLineId={selectedLineId}
                                        closeLineHeadersCopyView={props.closeLineHeadersCopyView}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    })
);

interface ILineHeaderRowsProps {
    lineHeaders: ILineHeader[];
    selectedLineId: string;
    closeLineHeadersCopyView: Function;
    lineStore?: LineStore;
    lineHeaderMassEditStore?: LineHeaderMassEditStore;
}

const LineHeaderTable = inject(
    'lineStore',
    'lineHeaderMassEditStore'
)(
    observer((props: ILineHeaderRowsProps) => {
        const [selectedRowIndexes, setSelectedRowIndexes] = useState<number[]>([]);
        const toggleSelectedRow = ({ index }: { index: number }) => {
            let newArray = selectedRowIndexes;
            if (selectedRowIndexes.includes(index)) {
                newArray = newArray.filter((i) => i !== index);
            } else {
                newArray = newArray.concat([index]);
            }
            setSelectedRowIndexes(newArray);
        };
        const copyLineHeaders = () => {
            selectedRowIndexes.sort();
            const lineHeadersToCopy: ILineHeader[] = [];
            selectedRowIndexes.forEach((index) => {
                lineHeadersToCopy.push(props.lineHeaders[index]);
            });
            props.lineHeaderMassEditStore!.copyLineHeaders({
                lineId: props.lineStore!.line!.id,
                lineHeaders: lineHeadersToCopy,
            });
            props.closeLineHeadersCopyView();
        };
        return (
            <>
                {props.selectedLineId.length > 0 && (
                    <>
                        {props.lineHeaders.length > 0 ? (
                            <div className={s.lineHeaderTableContainer}>
                                <table className={s.lineHeaderTable}>
                                    <tbody>
                                        <tr>
                                            <th
                                                className={classnames(s.inputLabel, s.columnHeader)}
                                            >
                                                LINJAN NIMI
                                            </th>
                                            <th
                                                className={classnames(s.inputLabel, s.columnHeader)}
                                            >
                                                VOIM. AST
                                            </th>
                                            <th
                                                className={classnames(s.inputLabel, s.columnHeader)}
                                            >
                                                VIIM. VOIM.
                                            </th>
                                            <th />
                                            <th />
                                            <th />
                                        </tr>
                                        {props.lineHeaders.map(
                                            (lineHeader: ILineHeader, index: number) => {
                                                return (
                                                    <tr
                                                        className={classnames(
                                                            s.tableRow,
                                                            selectedRowIndexes.includes(index)
                                                                ? s.selectedRow
                                                                : undefined
                                                        )}
                                                        key={`lineHeaderRow-${index}`}
                                                        onClick={() => toggleSelectedRow({ index })}
                                                    >
                                                        <td className={s.tableCell}>
                                                            {lineHeader.lineNameFi}
                                                        </td>
                                                        <td className={s.tableCell}>
                                                            {toDateString(lineHeader.startDate)}
                                                        </td>
                                                        <td className={s.tableCell}>
                                                            {toDateString(lineHeader.endDate)}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                                <Button
                                    className={s.copyLineHeadersButton}
                                    disabled={selectedRowIndexes.length === 0}
                                    onClick={copyLineHeaders}
                                >
                                    Kopioi valitut linjan otsikot
                                </Button>
                            </div>
                        ) : (
                            <div>Linjan otsikoita linjalle {props.selectedLineId} ei löytynyt.</div>
                        )}
                    </>
                )}
            </>
        );
    })
);

export default SearchLineHeadersToCopy;
