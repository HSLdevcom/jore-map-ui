import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { match } from 'react-router';
import { Checkbox } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import Loader from '~/components/shared/loader/Loader';
import TransitType from '~/enums/transitType';
import { IRoutePath } from '~/models';
import { ISearchLine } from '~/models/ILine';
import LineService from '~/services/lineService';
import RoutePathService from '~/services/routePathService';
import { createLineDropdownItems } from '~/utils/dropdownUtils';
import RoutePathComparisonContainer from '../../../shared/routePathComparisonContainer/RoutePathComparisonContainer';
import SidebarHeader from '../../SidebarHeader';
import RoutePathSelector from './RoutePathSelector';
import RoutePathTabs from './RoutePathTabs';
import * as s from './routePathComparisonView.scss';

interface IRoutePathComparisonViewProps {
    match?: match<any>;
}

interface IRoutePathSelection {
    lineId: string;
    routeId: string;
    startDate?: Date;
    direction?: string;
    transitType: TransitType;
}

enum RoutePathSelection {
    ROUTEPATH_1 = 1,
    ROUTEPATH_2 = 2,
}

const RoutePathComparisonView = inject()(
    observer((props: IRoutePathComparisonViewProps) => {
        const [isLoading, setIsLoading] = useState<boolean>(true);
        const [lineId, routeId, startDate, direction] = props.match!.params.id.split(',');
        const [lineQueryResult, setLineQueryResult] = useState<ISearchLine[]>([]);
        const [lineDropdownItems, setLineDropdownItems] = useState<IDropdownItem[]>([]);
        const [areInactiveLinesHidden, setAreInactiveLinesHidden] = useState<boolean>(true);
        // TODO: get selectedRoutePath2 from URL too. Maybe use ?routePath1=...&routePath2=... syntax

        const [routePathSelection1, setRoutePathSelection1] = useState<IRoutePathSelection>({
            lineId,
            routeId,
            startDate,
            direction,
            transitType: TransitType.BUS, // TODO: change
        });
        const [routePathSelection2, setRoutePathSelection2] = useState<IRoutePathSelection>({
            lineId,
            routeId,
            startDate: undefined,
            direction: undefined,
            transitType: TransitType.BUS, // TODO: change
        });
        const [routePath1, setRoutePath1] = useState<IRoutePath | null>(null);
        const [routePath2, setRoutePath2] = useState<IRoutePath | null>(null);

        useEffect(() => {
            const fetch = async () => {
                const lineQueryResult: ISearchLine[] = await LineService.fetchAllSearchLines();
                // TODO: transitType filtering?
                const result: IDropdownItem[] = createLineDropdownItems({
                    areInactiveLinesHidden,
                    lines: lineQueryResult,
                });
                setLineQueryResult(lineQueryResult);
                setLineDropdownItems(result);
                setIsLoading(false);
            };
            fetch();
        }, [areInactiveLinesHidden]);

        useEffect(() => {
            const fetchRoutePath = async (
                routePathSelection: IRoutePathSelection
            ): Promise<IRoutePath> => {
                const rp: IRoutePath | null = await RoutePathService.fetchRoutePath(
                    routePathSelection!.routeId,
                    routePathSelection!.startDate!,
                    routePathSelection!.direction!
                );
                if (!rp) {
                    throw `RoutePath not found: ${routePathSelection.routeId} ${routePathSelection.direction} ${routePathSelection.startDate}`;
                }
                return rp;
            };
            const fetchRoutePaths = async () => {
                const rp1 = await fetchRoutePath(routePathSelection1!);
                const rp2 = await fetchRoutePath(routePathSelection2!);
                setRoutePath1(rp1);
                setRoutePath2(rp2);
            };
            if (routePathSelection1.startDate && routePathSelection2.startDate) {
                fetchRoutePaths();
            }
        }, [routePathSelection1, routePathSelection2]);

        const deselectRoutePath = (routePathSelection: RoutePathSelection) => {
            if (routePathSelection === RoutePathSelection.ROUTEPATH_1) {
                setRoutePathSelection1({
                    ...routePathSelection1,
                    startDate: undefined,
                    direction: undefined,
                });
                setRoutePath1(null);
            } else {
                setRoutePathSelection2({
                    ...routePathSelection2,
                    startDate: undefined,
                    direction: undefined,
                });
                setRoutePath2(null);
            }
        };

        if (isLoading) {
            return (
                <div className={s.routePathComparisonView}>
                    <Loader />
                </div>
            );
        }

        return (
            <div className={s.routePathComparisonView}>
                <div className={s.sidebarContainer}>
                    <SidebarHeader isCloseButtonVisible={true} isBackButtonVisible={true}>
                        Reitinsuuntien vertailu
                    </SidebarHeader>
                </div>
                <RoutePathTabs
                    routePathSelection1={routePathSelection1}
                    routePathSelection2={routePathSelection2}
                    deselectRoutePath={deselectRoutePath}
                />

                {routePath1 !== null && routePath2 !== null ? (
                    <RoutePathComparisonContainer routePath1={routePath1} routePath2={routePath2} />
                ) : (
                    <div className={s.routePathSelectorsWrapper}>
                        <div className={s.flexRow}>
                            <Checkbox
                                content='Näytä vain aktiiviset linjat'
                                checked={areInactiveLinesHidden}
                                onClick={() => setAreInactiveLinesHidden(!areInactiveLinesHidden)}
                            />
                        </div>
                        <div className={s.routePathSelectors}>
                            <div className={s.routePathSelectionContainer}>
                                <RoutePathSelector
                                    lineQueryResult={lineQueryResult}
                                    lineDropdownItems={lineDropdownItems}
                                    routePathSelection={routePathSelection1}
                                    setSelectedRoutePath={(routePath: IRoutePathSelection) => {
                                        setRoutePathSelection1(routePath);
                                    }}
                                />
                            </div>
                            <div className={s.routePathSelectionContainer}>
                                <RoutePathSelector
                                    lineQueryResult={lineQueryResult}
                                    lineDropdownItems={lineDropdownItems}
                                    routePathSelection={routePathSelection2}
                                    setSelectedRoutePath={(routePath: IRoutePathSelection) => {
                                        setRoutePathSelection2(routePath);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    })
);

export default RoutePathComparisonView;

export { IRoutePathSelection, RoutePathSelection };
