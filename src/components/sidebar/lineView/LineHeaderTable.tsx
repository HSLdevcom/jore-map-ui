import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import { Button } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import ButtonType from '~/enums/buttonType';
import ILineHeader from '~/models/ILineHeader';
import IMassEditLineHeader, { ILineHeaderPrimaryKey } from '~/models/IMassEditLineHeader';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LineHeaderService from '~/services/lineHeaderService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { LineHeaderMassEditStore } from '~/stores/lineHeaderMassEditStore';
import SidebarHeader from '../SidebarHeader';
import * as s from './lineHeaderTable.scss';

interface ILineHeaderState {
    isLoading: boolean;
    lineHeaders: ILineHeader[] | null;
}

interface ILineHeaderListProps {
    lineId: string;
    lineHeaderMassEditStore?: LineHeaderMassEditStore;
    confirmStore?: ConfirmStore;
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
}

@inject('lineHeaderMassEditStore', 'confirmStore', 'alertStore', 'errorStore')
@observer
class LineHeaderTable extends React.Component<ILineHeaderListProps, ILineHeaderState> {
    private mounted: boolean;
    constructor(props: ILineHeaderListProps) {
        super(props);
        this.state = {
            isLoading: true,
            lineHeaders: null
        };
    }
    async componentWillMount() {
        const lineHeaders: ILineHeader[] = await LineHeaderService.fetchLineHeaders(
            this.props.lineId
        );
        if (this.mounted) {
            this.setState({
                lineHeaders,
                isLoading: false
            });
        }
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentDidUpdate() {
        const lineHeaders = this.state.lineHeaders;
        if (lineHeaders && !this.props.lineHeaderMassEditStore!.massEditLineHeaders) {
            this.props.lineHeaderMassEditStore!.init(lineHeaders);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.props.lineHeaderMassEditStore!.clear();
    }

    private redirectToEditLineHeaderView = (startDate: Date) => () => {
        const editLineHeaderLink = routeBuilder
            .to(SubSites.lineHeader)
            .toTarget(':id', this.props.lineId)
            .toTarget(':startDate', Moment(startDate).format())
            .toLink();

        navigator.goTo(editLineHeaderLink);
    };
    private redirectToNewLineHeaderView = () => {
        const newLineHeaderLink = routeBuilder
            .to(SubSites.newLineHeader)
            .toTarget(':id', this.props.lineId)
            .toLink();

        navigator.goTo(newLineHeaderLink);
    };

    private onChangeLineHeaderStartDate = (id: ILineHeaderPrimaryKey) => (value: Date) => {
        this.props.lineHeaderMassEditStore!.updateLineHeaderStartDate(id, value);
    };

    private onChangeLineHeaderEndDate = (id: ILineHeaderPrimaryKey) => (value: Date) => {
        this.props.lineHeaderMassEditStore!.updateLineHeaderEndDate(id, value);
    };

    private removeLineHeader = (massEditLineHeader: IMassEditLineHeader) => () => {
        const confirmText = `Haluatko varmasti poistaa linjan otsikon ${
            massEditLineHeader.lineHeader.lineNameFi
        }?`;
        this.props.confirmStore!.openConfirm(confirmText, () => {
            this.props.lineHeaderMassEditStore!.removeLineHeader(massEditLineHeader.id);
        });
    };

    private renderLineHeaderRows = (activeMassEditLineHeader: IMassEditLineHeader | null) => {
        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        const isEditingDisabled = lineHeaderMassEditStore!.isEditingDisabled;
        const unRemovedLineHeaderCount = lineHeaderMassEditStore!.massEditLineHeaders!.filter(
            m => !m.isRemoved
        ).length;

        return lineHeaderMassEditStore!.massEditLineHeaders!.map(
            (currentMassEditLineHeader: IMassEditLineHeader, index: number) => {
                if (currentMassEditLineHeader.isRemoved) return null;

                const lineHeader = currentMassEditLineHeader.lineHeader;
                const isCurrentLineHeader =
                    activeMassEditLineHeader &&
                    activeMassEditLineHeader.id === currentMassEditLineHeader.id;
                const validationResult = currentMassEditLineHeader.validationResult;
                return (
                    <tr
                        key={index}
                        className={classnames(
                            s.lineHeaderTableRow,
                            isCurrentLineHeader ? s.lineHeaderRowHighlight : undefined
                        )}
                    >
                        <td>{lineHeader.lineNameFi}</td>
                        <td className={s.lineHeaderTableCalendarCell}>
                            <InputContainer
                                className={s.timeInput}
                                disabled={isEditingDisabled}
                                label=''
                                type='date'
                                value={lineHeader.startDate}
                                onChange={this.onChangeLineHeaderStartDate(
                                    currentMassEditLineHeader.id
                                )}
                                validationResult={validationResult}
                            />
                        </td>
                        <td className={s.lineHeaderTableCalendarCell}>
                            <InputContainer
                                className={s.timeInput}
                                disabled={isEditingDisabled}
                                label=''
                                type='date'
                                value={lineHeader.endDate}
                                onChange={this.onChangeLineHeaderEndDate(
                                    currentMassEditLineHeader.id
                                )}
                            />
                        </td>
                        <td className={s.lineHeaderTableButtonCell}>
                            <Button
                                className={s.lineHeaderButton}
                                hasReverseColor={true}
                                onClick={this.redirectToEditLineHeaderView(
                                    currentMassEditLineHeader.id.originalStartDate
                                )}
                            >
                                <FiInfo />
                            </Button>
                        </td>
                        <td className={s.lineHeaderTableButtonCell}>
                            <Button
                                className={classnames(s.lineHeaderButton, s.removeLineHeaderButton)}
                                hasReverseColor={true}
                                onClick={this.removeLineHeader(currentMassEditLineHeader)}
                                disabled={isEditingDisabled || unRemovedLineHeaderCount <= 1}
                            >
                                <FaTrashAlt />
                            </Button>
                        </td>
                    </tr>
                );
            }
        );
    };

    private getActiveMassEditLineHeader = (): IMassEditLineHeader | null => {
        const currentTime = new Date().getTime();
        let activeMassEditLineHeader = null;
        this.props.lineHeaderMassEditStore!.massEditLineHeaders!.forEach(
            (m: IMassEditLineHeader) => {
                if (m.isRemoved) return;
                const lineHeader = m.lineHeader;
                if (
                    currentTime > lineHeader.startDate!.getTime() &&
                    currentTime < lineHeader.endDate!.getTime()
                ) {
                    activeMassEditLineHeader = m;
                }
            }
        );
        return activeMassEditLineHeader;
    };

    private save = async () => {
        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        this.setState({ isLoading: true });

        try {
            await LineHeaderService.massEditLineHeaders(
                lineHeaderMassEditStore!.massEditLineHeaders!
            );

            this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
            return;
        }

        lineHeaderMassEditStore!.init(lineHeaderMassEditStore!.currentLineHeaders);

        this.setState({
            isLoading: false
        });
    };

    private isFormValid = () => {
        let isFormValid = true;
        this.props.lineHeaderMassEditStore!.massEditLineHeaders!.forEach(
            (m: IMassEditLineHeader) => {
                if (m.isRemoved) return;
                if (!m.validationResult.isValid) {
                    isFormValid = false;
                }
            }
        );
        return isFormValid;
    };

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.lineHeaderTableView, s.loaderContainer)}>
                    <Loader size={LoaderSize.TINY} />
                </div>
            );
        }

        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        const massEditLineHeaders = lineHeaderMassEditStore!.massEditLineHeaders;
        const isEditingDisabled = lineHeaderMassEditStore!.isEditingDisabled;
        if (!massEditLineHeaders) return null;

        const activeMassEditLineHeader = this.getActiveMassEditLineHeader();

        const isSaveButtonDisabled =
            isEditingDisabled ||
            !lineHeaderMassEditStore!.isDirty ||
            !this.isFormValid() ||
            !activeMassEditLineHeader;
        return (
            <div className={s.lineHeaderTableView}>
                <SidebarHeader
                    isEditing={!isEditingDisabled}
                    onEditButtonClick={lineHeaderMassEditStore!.toggleIsEditingDisabled}
                    hideCloseButton={true}
                    hideBackButton={true}
                    isEditButtonVisible={massEditLineHeaders.length > 0}
                >
                    Linjan otsikot
                </SidebarHeader>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={true}
                        label={'LINJAN VOIMASSAOLEVA OTSIKKO'}
                        value={
                            activeMassEditLineHeader
                                ? activeMassEditLineHeader.lineHeader.lineNameFi
                                : 'Ei voimassa olevaa otsikkoa.'
                        }
                        validationResult={{
                            isValid: Boolean(activeMassEditLineHeader)
                        }}
                        isInputColorRed={!Boolean(activeMassEditLineHeader)}
                    />
                </div>
                {massEditLineHeaders.length > 0 ? (
                    <table className={s.lineHeaderTable}>
                        <tbody>
                            <tr>
                                <th className={classnames(s.inputLabel, s.columnHeader)}>
                                    LINJAN NIMI
                                </th>
                                <th className={classnames(s.inputLabel, s.columnHeader)}>
                                    VOIM. AST
                                </th>
                                <th className={classnames(s.inputLabel, s.columnHeader)}>
                                    VIIM. VOIM.
                                </th>
                                <th />
                                <th />
                            </tr>
                            {this.renderLineHeaderRows(activeMassEditLineHeader)}
                        </tbody>
                    </table>
                ) : (
                    <div>Linjalle {this.props.lineId} ei löytynyt otsikoita.</div>
                )}
                <div className={s.buttonContainer}>
                    <Button
                        className={s.createNewLineHeaderButton}
                        type={ButtonType.SQUARE}
                        disabled={false}
                        hasPadding={true}
                        onClick={() => this.redirectToNewLineHeaderView()}
                    >
                        Luo uusi linjan otsikko
                    </Button>
                    <Button
                        className={s.saveLineHeadersButton}
                        onClick={this.save}
                        type={ButtonType.SAVE}
                        disabled={isSaveButtonDisabled}
                    >
                        Tallenna linjan otsikot
                    </Button>
                </div>
            </div>
        );
    }
}

export default LineHeaderTable;
