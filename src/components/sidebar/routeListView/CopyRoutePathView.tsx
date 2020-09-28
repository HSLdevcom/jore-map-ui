import classnames from 'classnames';
import _ from 'lodash';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { Button, Checkbox, ToggleSwitch } from '~/components/controls';
import Dropdown, { IDropdownItem } from '~/components/controls/Dropdown';
import Loader from '~/components/shared/loader/Loader';
import { IRoutePath } from '~/models';
import { ISearchLine } from '~/models/ILine';
import LineService from '~/services/lineService';
import RoutePathService from '~/services/routePathService';
import RouteService from '~/services/routeService';
import { IRoutePathToCopy, RoutePathCopyStore } from '~/stores/routePathCopyStore';
import { RoutePathLayerListStore } from '~/stores/routePathLayerListStore';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import { createDropdownItemsFromList } from '~/utils/dropdownUtils';
import SidebarHeader from '../SidebarHeader';
import * as s from './copyRoutePathView.scss';

interface ICopyRoutePathViewProps {
    routePathCopyStore?: RoutePathCopyStore;
    routePathLayerListStore?: RoutePathLayerListStore;
}

interface ICopyRoutePathState {
    isLoading: boolean;
    selectedLineId: string | null;
    selectedRouteId: string | null;
    selectedRoutePaths: IRoutePath[];
    lineQueryResult: ISearchLine[];
    routePathQueryResults: IRoutePath[];
    lineDropdownItems: IDropdownItem[];
    routeDropdownItems: IDropdownItem[];
    newRoutePathCounter: number;
    areInactiveLinesHidden: boolean;
}

@inject('routePathCopyStore', 'routePathLayerListStore')
@observer
class CopyRoutePathView extends React.Component<ICopyRoutePathViewProps, ICopyRoutePathState> {
    private areInactiveLinesHiddenListener: IReactionDisposer;
    private _isMounted: boolean;
    state: ICopyRoutePathState = {
        isLoading: true,
        selectedLineId: null,
        selectedRouteId: null,
        selectedRoutePaths: [],
        lineQueryResult: [],
        routePathQueryResults: [],
        lineDropdownItems: [],
        routeDropdownItems: [],
        newRoutePathCounter: 0,
        areInactiveLinesHidden: true,
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
            (l) => l.transitType === this.props.routePathCopyStore!.transitType
        );
        this._setState({ lineQueryResult, isLoading: false });
        this.createLineDropdownItems();

        this.areInactiveLinesHiddenListener = reaction(
            () => this.state.areInactiveLinesHidden,
            this.createLineDropdownItems
        );
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.props.routePathCopyStore!.clear();
        this.areInactiveLinesHiddenListener();
    }

    private createLineDropdownItems = () => {
        let filteredLineQueryResult = this.state.lineQueryResult;
        if (this.state.areInactiveLinesHidden) {
            filteredLineQueryResult = filteredLineQueryResult.filter((line) => {
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
            filteredLineQueryResult.map((s) => s.id)
        );
        this._setState({
            lineDropdownItems,
        });
    };

    private copyRoutePaths = () => {
        this.props.routePathCopyStore!.copyRoutePaths();
    };

    private onLineChange = (value: string) => {
        const routeDropdownItems = createDropdownItemsFromList(
            this.state.lineQueryResult.find((s) => s.id === value)!.routes.map((r) => r.id)
        );
        this.setState({
            routeDropdownItems,
            selectedLineId: value,
            selectedRouteId: null,
            selectedRoutePaths: [],
            routePathQueryResults: [],
        });
        this.state.selectedRoutePaths.forEach((rp) =>
            this.props.routePathLayerListStore!.removeRoutePath(rp.internalId)
        );
    };

    private onRouteChange = async (routeId: string) => {
        const route = await RouteService.fetchRoute({ routeId, areRoutePathLinksExcluded: true });
        let newRoutePathCounter = this.state.newRoutePathCounter;
        const routePathQueryResult = route!.routePaths!.map((rp) => {
            const newId = `${newRoutePathCounter}-copy-${rp.internalId}`;
            newRoutePathCounter += 1;
            rp.internalId = newId;
            return rp;
        });
        this.setState({
            newRoutePathCounter,
            routePathQueryResults: routePathQueryResult,
            selectedRouteId: routeId,
            selectedRoutePaths: [],
        });
        this.state.selectedRoutePaths.forEach((rp) =>
            this.props.routePathLayerListStore!.removeRoutePath(rp.internalId)
        );
    };

    private toggleRoutePath = (routePath: IRoutePath) => async () => {
        const shouldRemove =
            this.state.selectedRoutePaths.findIndex(
                (rp) => rp.internalId === routePath.internalId
            ) >= 0;
        if (shouldRemove) {
            const selectedRoutePaths = this.state.selectedRoutePaths;
            const removeIndex = selectedRoutePaths.findIndex(
                (rp) => rp.internalId === routePath.internalId
            );
            selectedRoutePaths.splice(removeIndex, 1);
            this.props.routePathLayerListStore!.removeRoutePath(routePath.internalId);
            this._setState({
                selectedRoutePaths,
            });
        } else {
            const routePathWithLinks = await RoutePathService.fetchRoutePath(
                routePath.routeId,
                routePath.startDate,
                routePath.direction
            );
            // State might already have this routePath (async query, selecting item twice quickly. Read fresh selectedRoutePaths variable from state)
            let selectedRoutePaths = this.state.selectedRoutePaths;
            // isFoundFromQueryResult is used to ensure that routePathQueryResult still has routePath to select
            const isFoundFromQueryResult = this.state.routePathQueryResults.find(
                (rpQueryResult) => {
                    return rpQueryResult.internalId === routePath.internalId;
                }
            );

            if (
                !Boolean(isFoundFromQueryResult) ||
                Boolean(selectedRoutePaths.find((rp) => rp.internalId === routePath.internalId))
            ) {
                return;
            }
            routePathWithLinks!.isVisible = true;
            routePathWithLinks!.internalId = _.cloneDeep(routePath).internalId;
            selectedRoutePaths = selectedRoutePaths.concat(routePathWithLinks!);
            this.props.routePathLayerListStore!.addRoutePaths({
                routePaths: [routePathWithLinks!],
            });
            this._setState({
                selectedRoutePaths,
            });
        }
    };

    private addRoutePathsToCopy = () => {
        this.props.routePathCopyStore!.addRoutePathsToCopy(this.state.selectedRoutePaths);
        this._setState({
            selectedRoutePaths: [],
        });
        // To refresh routePathQueryResult, get new ids to replace existing ones (to prevent id overlap)
        this.onRouteChange(this.state.selectedRouteId!);
    };

    private onDirectionChange = (id: string) => (value: string) => {
        this.props.routePathCopyStore!.setRoutePathToCopyDirection(id, value);
    };

    private removeRoutePathToCopy = (id: string) => () => {
        this.props.routePathCopyStore!.removeRoutePathToCopy(id);
    };

    private onBackButtonClick = () => {
        this.props.routePathCopyStore!.restoreRouteListRoutePaths();
        this.props.routePathCopyStore!.clear();
    };

    private toggleAreInactiveLinesHidden = () => {
        this.setState({
            areInactiveLinesHidden: !this.state.areInactiveLinesHidden,
        });
    };

    render() {
        const routePathCopyStore = this.props.routePathCopyStore!;
        const lineId = routePathCopyStore.lineId;
        const routeId = routePathCopyStore.routeId;
        const transitType = routePathCopyStore.transitType;
        const routePathsToCopy = routePathCopyStore!.routePathsToCopy;

        if (this.state.isLoading) return <Loader />;

        return (
            <div className={s.copyRoutePathView} data-cy='copyRoutePathView'>
                <SidebarHeader
                    className={s.sidebarHeader}
                    isBackButtonVisible={true}
                    isEditPromptHidden={true}
                    onBackButtonClick={() => this.onBackButtonClick()}
                >
                    <div>
                        Kopioi reitinsuuntia linjan{' '}
                        <span className={TransitTypeUtils.getColorClass(transitType)}>
                            {lineId}
                        </span>{' '}
                        reitille{' '}
                        <span className={TransitTypeUtils.getColorClass(transitType)}>
                            {routeId}
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
                                    <th align='left'></th>
                                </tr>
                                {routePathsToCopy.map(
                                    (rpToCopy: IRoutePathToCopy, index: number) => {
                                        const rpFromRpLayerStore = this.props.routePathLayerListStore!.getRoutePath(
                                            rpToCopy.id
                                        );
                                        const isVisible = rpFromRpLayerStore
                                            ? Boolean(rpFromRpLayerStore.isVisible)
                                            : false;
                                        const color =
                                            rpFromRpLayerStore && rpFromRpLayerStore.color
                                                ? rpFromRpLayerStore.color
                                                : '#898989';
                                        return (
                                            <tr
                                                key={`rpToCopyRow-${index}`}
                                                data-cy={`rpToCopyRow-${index}`}
                                            >
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
                                                    {Moment(rpToCopy.routePath.startDate).format(
                                                        'DD.MM.YYYY'
                                                    )}
                                                </td>
                                                <td className={s.maxWidthColumn}>
                                                    {Moment(rpToCopy.routePath.endDate).format(
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
                                                <td>
                                                    <ToggleSwitch
                                                        onClick={() =>
                                                            this.props.routePathLayerListStore!.toggleRoutePathVisibility(
                                                                rpToCopy.id
                                                            )
                                                        }
                                                        value={isVisible}
                                                        color={color}
                                                    />
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
                                data-cy='lineDropdown'
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
                                data-cy='routeDropdown'
                            />
                        </div>
                        <div className={s.flexRow}>
                            <Checkbox
                                content='Näytä vain aktiiviset linjat'
                                checked={this.state.areInactiveLinesHidden}
                                onClick={this.toggleAreInactiveLinesHidden}
                            />
                        </div>
                        {this.state.selectedRouteId && (
                            <div className={classnames(s.flexRow, s.routePathSelectView)}>
                                <div className={s.subTopic}>Valittavat reitinsuunnat</div>
                                {this.state.routePathQueryResults.length === 0 ? (
                                    <div className={s.noQueryResults}>
                                        Reitiltä {this.state.selectedRouteId} ei löytynyt
                                        reitinsuuntia.
                                    </div>
                                ) : (
                                    <>
                                        <div className={s.findRoutePathTableWrapper}>
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
                                                    {this.state.routePathQueryResults.map(
                                                        (routePath: IRoutePath, index: number) => {
                                                            const isSelected = Boolean(
                                                                this.state.selectedRoutePaths.find(
                                                                    (rp) =>
                                                                        rp.internalId ===
                                                                        routePath.internalId
                                                                )
                                                            );
                                                            let color;
                                                            if (isSelected) {
                                                                color = this.props.routePathLayerListStore!.getRoutePath(
                                                                    routePath.internalId
                                                                )!.color!;
                                                            }
                                                            const selectedBackgroundColorStyle = {
                                                                backgroundColor: color,
                                                            };
                                                            return (
                                                                <tr
                                                                    key={`rpQueryResult-${index}`}
                                                                    onClick={this.toggleRoutePath(
                                                                        routePath
                                                                    )}
                                                                    className={
                                                                        isSelected
                                                                            ? s.selectedRow
                                                                            : undefined
                                                                    }
                                                                    data-cy={`rpQueryResult`}
                                                                >
                                                                    <td>{routePath.direction}</td>
                                                                    <td
                                                                        className={s.maxWidthColumn}
                                                                    >
                                                                        {routePath.originFi}
                                                                    </td>
                                                                    <td
                                                                        className={s.maxWidthColumn}
                                                                    >
                                                                        {routePath.destinationFi}
                                                                    </td>
                                                                    <td
                                                                        className={s.maxWidthColumn}
                                                                    >
                                                                        {Moment(
                                                                            routePath.startDate
                                                                        ).format('DD.MM.YYYY')}
                                                                    </td>
                                                                    <td
                                                                        className={s.maxWidthColumn}
                                                                    >
                                                                        {Moment(
                                                                            routePath.endDate
                                                                        ).format('DD.MM.YYYY')}
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            className={s.circle}
                                                                            style={
                                                                                isSelected
                                                                                    ? selectedBackgroundColorStyle
                                                                                    : undefined
                                                                            }
                                                                            data-cy={
                                                                                isSelected
                                                                                    ? 'selectedRp'
                                                                                    : ''
                                                                            }
                                                                        ></div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <Button
                                            className={s.addRoutePathToCopyButton}
                                            disabled={this.state.selectedRoutePaths.length === 0}
                                            onClick={this.addRoutePathsToCopy}
                                            data-cy='addRoutePathsToCopy'
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
                    onClick={this.copyRoutePaths}
                    data-cy='copyRoutePaths'
                >
                    Kopioi valitut reitinsuunnat
                </Button>
            </div>
        );
    }
}

export default CopyRoutePathView;
