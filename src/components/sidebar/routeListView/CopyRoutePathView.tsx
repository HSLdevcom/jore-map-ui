import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { Button } from '~/components/controls';
import Dropdown, { IDropdownItem } from '~/components/controls/Dropdown';
import Loader from '~/components/shared/loader/Loader';
import { IRoutePath } from '~/models';
import ISearchLine from '~/models/searchModels/ISearchLine';
import LineService from '~/services/lineService';
import RoutePathService from '~/services/routePathService';
import RouteService from '~/services/routeService';
import { CopyRoutePathStore, IRoutePathToCopy } from '~/stores/copyRoutePathStore';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import { createDropdownItemsFromList } from '~/utils/dropdownUtils';
import SidebarHeader from '../SidebarHeader';
import * as s from './copyRoutePathView.scss';

interface ICopyRoutePathViewProps {
    copyRoutePathStore?: CopyRoutePathStore;
}

interface ICopyRoutePathState {
    isLoading: boolean;
    selectedLineId: string | null;
    selectedRouteId: string | null;
    selectedRoutePathIds: string[];
    lineQueryResult: ISearchLine[];
    routePathQueryResult: IRoutePath[];
    lineDropdownItems: IDropdownItem[];
    routeDropdownItems: IDropdownItem[];
}

@inject('copyRoutePathStore')
@observer
class CopyRoutePathView extends React.Component<ICopyRoutePathViewProps, ICopyRoutePathState> {
    private _isMounted: boolean;
    state: ICopyRoutePathState = {
        isLoading: true,
        selectedLineId: null,
        selectedRouteId: null,
        selectedRoutePathIds: [],
        lineQueryResult: [],
        routePathQueryResult: [],
        lineDropdownItems: [],
        routeDropdownItems: [],
    };

    private _setState = (newState: object) => {
        if (this._isMounted) {
            this.setState(newState);
        }
    };

    async componentDidMount() {
        this._isMounted = true;
        this._setState({ isLoading: true });
        const lineQueryResult: ISearchLine[] = (await LineService.fetchAllSearchLines()).filter(
            (l) => l.transitType === this.props.copyRoutePathStore!.transitType
        );
        const lineDropdownItems = createDropdownItemsFromList(lineQueryResult.map((s) => s.id));
        this._setState({ lineQueryResult, lineDropdownItems, isLoading: false });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    private copyRoutePathPair = () => {
        this.props.copyRoutePathStore!.copyRoutePathPair();
    };

    private onLineChange = (value: string) => {
        const routeDropdownItems = createDropdownItemsFromList(
            this.state.lineQueryResult.find((s) => s.id === value)!.routes.map((r) => r.id)
        );
        this.setState({
            routeDropdownItems,
            selectedLineId: value,
            selectedRouteId: null,
            selectedRoutePathIds: [],
            routePathQueryResult: [],
        });
    };

    private onRouteChange = async (value: string) => {
        const route = await RouteService.fetchRoute(value, {
            areRoutePathLinksExcluded: true,
        });
        const routePathQueryResult = route?.routePaths!;
        this.setState({
            routePathQueryResult,
            selectedRouteId: value,
            selectedRoutePathIds: [],
        });
    };

    private toggleRoutePath = (routePath: IRoutePath) => () => {
        const index = this.state.selectedRoutePathIds.findIndex(
            (id) => id === routePath.internalId
        );
        let selectedRoutePathIds;
        if (index >= 0) {
            selectedRoutePathIds = this.state.selectedRoutePathIds;
            selectedRoutePathIds.splice(index, 1);
        } else {
            selectedRoutePathIds = this.state.selectedRoutePathIds.concat([routePath.internalId]);
        }
        this._setState({
            selectedRoutePathIds,
        });
    };

    private addRoutePathsToCopy = async () => {
        const routePaths: IRoutePath[] = [];
        const selectedRoutePathIds = this.state.selectedRoutePathIds;
        // Empty selected routePathIds to disable copy button right away (prevent clicking it twice)
        this._setState({
            selectedRoutePathIds: [],
        });
        for (const index in selectedRoutePathIds) {
            const rpId = selectedRoutePathIds[index];
            const routePathWithoutLinks = this.state.routePathQueryResult.find(
                (rp) => rp.internalId === rpId
            )!;
            const routePathWithLinks = await RoutePathService.fetchRoutePath(
                routePathWithoutLinks.routeId,
                routePathWithoutLinks.startTime,
                routePathWithoutLinks.direction
            );
            routePaths.push(routePathWithLinks!);
        }
        this.props.copyRoutePathStore!.addRoutePathsToCopy(routePaths);
    };

    private onDirectionChange = (id: string) => (value: string) => {
        this.props.copyRoutePathStore!.setRoutePathToCopyDirection(id, value);
    };

    private removeRoutePathToCopy = (id: string) => () => {
        this.props.copyRoutePathStore!.removeRoutePathToCopy(id);
    };

    render() {
        const copyRoutePathStore = this.props.copyRoutePathStore!;
        const lineId = copyRoutePathStore.lineId;
        const transitType = copyRoutePathStore.transitType;
        const routePathsToCopy = copyRoutePathStore!.routePathsToCopy;

        if (this.state.isLoading) return <Loader />;

        return (
            <div className={s.copyRoutePathView}>
                <SidebarHeader
                    className={s.sidebarHeader}
                    isCloseButtonVisible={true}
                    isEditButtonVisible={false}
                    isBackButtonVisible={false}
                    isEditPromptHidden={true}
                    onBackButtonClick={() => copyRoutePathStore.clear()}
                >
                    <div>
                        Kopioi reitinsuuntia linjan{' '}
                        <span className={TransitTypeUtils.getColorClass(transitType)}>
                            {lineId}
                        </span>{' '}
                        reitille{' '}
                        <span className={TransitTypeUtils.getColorClass(transitType)}>
                            {lineId}
                        </span>
                    </div>
                </SidebarHeader>
                <div className={s.copyRoutePathViewWrapper}>
                    <div className={s.subTopic}>Valitut reitinsuunnat</div>
                    {routePathsToCopy.length === 0 ? (
                        <div className={s.noQueryResults}>Ei valittuja reitinsuuntia.</div>
                    ) : (
                        <table className={s.routePathTable}>
                            <tbody className={s.routePathTableHeader}>
                                <tr>
                                    <th align='left'>Suunta</th>
                                    <th align='left'>Lähtöpaikka</th>
                                    <th align='left'>Päätepaikka</th>
                                    <th align='left'>Alkupvm</th>
                                    <th align='left'>Loppupvm</th>
                                    <th align='left'></th>
                                </tr>
                                {routePathsToCopy.map(
                                    (rpToCopy: IRoutePathToCopy, index: number) => {
                                        return (
                                            <tr key={`rpToCopyRow-${index}`}>
                                                <td>
                                                    <Dropdown
                                                        selected={rpToCopy.direction}
                                                        items={[
                                                            { value: '1', label: '1' },
                                                            { value: '2', label: '2' },
                                                        ]}
                                                        onChange={this.onDirectionChange(
                                                            rpToCopy.id
                                                        )}
                                                    />
                                                </td>
                                                <td className={s.maxWidthColumn}>
                                                    {rpToCopy.routePath.originFi}
                                                </td>
                                                <td className={s.maxWidthColumn}>
                                                    {rpToCopy.routePath.destinationFi}
                                                </td>
                                                <td className={s.maxWidthColumn}>
                                                    {Moment(rpToCopy.routePath.startTime).format(
                                                        'DD.MM.YYYY'
                                                    )}
                                                </td>
                                                <td className={s.maxWidthColumn}>
                                                    {Moment(rpToCopy.routePath.endTime).format(
                                                        'DD.MM.YYYY'
                                                    )}
                                                </td>
                                                <td>
                                                    <Button
                                                        className={s.removeRoutePathToCopyButton}
                                                        hasReverseColor={true}
                                                        onClick={this.removeRoutePathToCopy(
                                                            rpToCopy.id
                                                        )}
                                                    >
                                                        <FaTrashAlt />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    )}
                    <div className={classnames(s.form, s.selectView)}>
                        <div className={s.subTopic}>Etsi kopioitavia reitinsuuntia</div>
                        <div className={s.flexRow}>
                            <Dropdown
                                label='LINJA'
                                selected={this.state.selectedLineId}
                                items={this.state.lineDropdownItems}
                                onChange={this.onLineChange}
                                validationResult={
                                    !this.state.selectedLineId
                                        ? { isValid: false, errorMessage: 'Valitse linja' }
                                        : undefined
                                }
                            />
                            <Dropdown
                                label='REITTI'
                                selected={this.state.selectedRouteId}
                                disabled={!this.state.selectedLineId}
                                items={this.state.routeDropdownItems}
                                onChange={this.onRouteChange}
                                validationResult={
                                    this.state.selectedLineId && !this.state.selectedRouteId
                                        ? { isValid: false, errorMessage: 'Valitse reitti' }
                                        : undefined
                                }
                            />
                        </div>
                        {this.state.selectedRouteId && (
                            <div className={classnames(s.flexRow, s.routePathSelectView)}>
                                <div className={s.subTopic}>Valittavat reitinsuunnat</div>
                                {this.state.routePathQueryResult.length === 0 ? (
                                    <div className={s.noQueryResults}>
                                        Reitiltä {this.state.selectedRouteId} ei löytynyt
                                        reitinsuuntia.
                                    </div>
                                ) : (
                                    <>
                                        <table
                                            className={classnames(
                                                s.routePathTable,
                                                s.findRoutePathTable
                                            )}
                                        >
                                            <tbody className={s.routePathTableHeader}>
                                                <tr>
                                                    <th align='left'>Suunta</th>
                                                    <th align='left'>Lähtöpaikka</th>
                                                    <th align='left'>Päätepaikka</th>
                                                    <th align='left'>Alkupvm</th>
                                                    <th align='left'>Loppupvm</th>
                                                </tr>
                                                {this.state.routePathQueryResult.map(
                                                    (routePath: IRoutePath, index: number) => {
                                                        return (
                                                            <tr
                                                                key={`rpQueryResult-${index}`}
                                                                onClick={this.toggleRoutePath(
                                                                    routePath
                                                                )}
                                                                className={
                                                                    this.state.selectedRoutePathIds.includes(
                                                                        routePath.internalId
                                                                    )
                                                                        ? s.selectedRow
                                                                        : undefined
                                                                }
                                                            >
                                                                <td>{routePath.direction}</td>
                                                                <td className={s.maxWidthColumn}>
                                                                    {routePath.originFi}
                                                                </td>
                                                                <td className={s.maxWidthColumn}>
                                                                    {routePath.destinationFi}
                                                                </td>
                                                                <td className={s.maxWidthColumn}>
                                                                    {Moment(
                                                                        routePath.startTime
                                                                    ).format('DD.MM.YYYY')}
                                                                </td>
                                                                <td className={s.maxWidthColumn}>
                                                                    {Moment(
                                                                        routePath.endTime
                                                                    ).format('DD.MM.YYYY')}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </tbody>
                                        </table>
                                        <Button
                                            className={s.addRoutePathToCopyButton}
                                            disabled={this.state.selectedRoutePathIds.length === 0}
                                            onClick={this.addRoutePathsToCopy}
                                        >
                                            Lisää valitut reitinsuunnat kopioitavaksi
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    disabled={routePathsToCopy.length === 0}
                    hasPadding={true}
                    onClick={this.copyRoutePathPair}
                >
                    Kopioi valitut reitinsuunnat
                </Button>
            </div>
        );
    }
}

export default CopyRoutePathView;
