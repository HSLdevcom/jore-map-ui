import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { match } from 'react-router';
import { Button, Checkbox } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import Loader from '~/components/shared/loader/Loader';
import TransitType from '~/enums/transitType';
import { ISearchLine } from '~/models/ILine';
import LineService from '~/services/lineService';
import { RoutePathComparisonStore } from '~/stores/routePathComparisonStore';
import { createLineDropdownItems } from '~/utils/dropdownUtils';
import SidebarHeader from '../../SidebarHeader';
import RoutePathSelector from './RoutePathSelector';
import RoutePathTabs from './RoutePathTabs';
import * as s from './routePathComparisonView.scss';

interface IRoutePathComparisonViewProps {
    match?: match<any>;
    routePathComparisonStore: RoutePathComparisonStore;
}

interface IRoutePathSelection {
    lineId: string;
    routeId: string;
    startDate: Date;
    direction: string;
    transitType: TransitType;
}

enum RoutePathSelection {
    ROUTEPATH_1 = 1,
    ROUTEPATH_2 = 2,
}

const RoutePathComparisonView = inject('routePathComparisonStore')(
    observer((props: IRoutePathComparisonViewProps) => {
        const [isLoading, setIsLoading] = useState<boolean>(false);
        const [lineId, routeId, startDate, direction] = props.match!.params.id.split(',');
        const [lineQueryResult, setLineQueryResult] = useState<ISearchLine[]>([]);
        const [lineDropdownItems, setLineDropdownItems] = useState<IDropdownItem[]>([]);
        const [areInactiveLinesHidden, setAreInactiveLinesHidden] = useState<boolean>(true);
        // TODO: get selectedRoutePath2 from URL too. Maybe use ?routePath1=...&routePath2=... syntax

        const [routePathSelection1, setRoutePathSelection1] = useState<IRoutePathSelection | null>({
            lineId,
            routeId,
            startDate,
            direction,
            transitType: TransitType.BUS, // TODO: change
        });
        const [routePathSelection2, setRoutePathSelection2] = useState<IRoutePathSelection | null>({
            lineId,
            routeId,
            startDate,
            direction,
            transitType: TransitType.BUS, // TODO: change
        });

        useEffect(() => {
            setIsLoading(true);

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

        const deselectRoutePath = (routePathSelection: RoutePathSelection) => {
            if (routePathSelection === RoutePathSelection.ROUTEPATH_1) {
                setRoutePathSelection1(null);
            } else {
                setRoutePathSelection2(null);
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
                <div className={s.content}>
                    <div className={s.flexRow}>
                        <Checkbox
                            content='Näytä vain aktiiviset linjat'
                            checked={areInactiveLinesHidden}
                            onClick={() => setAreInactiveLinesHidden(!areInactiveLinesHidden)}
                        />
                    </div>
                    <div className={s.routePathSelectorsWrapper}>
                        <div className={s.routePathSelectionContainer}>
                            <RoutePathSelector
                                lineQueryResult={lineQueryResult}
                                lineDropdownItems={lineDropdownItems}
                                routePathSelection={routePathSelection1}
                                setSelectedRoutePath={(routePath: IRoutePathSelection) =>
                                    setRoutePathSelection1(routePath)
                                }
                            />
                        </div>
                        <div className={s.routePathSelectionContainer}>
                            <RoutePathSelector
                                lineQueryResult={lineQueryResult}
                                lineDropdownItems={lineDropdownItems}
                                routePathSelection={routePathSelection2}
                                setSelectedRoutePath={(routePath: IRoutePathSelection) =>
                                    setRoutePathSelection2(routePath)
                                }
                            />
                        </div>
                    </div>
                </div>
                <Button
                    className={s.startCompareButton}
                    onClick={() => alert('Toimintoa ei vielä ole toteutettu!')}
                    hasPadding={true}
                    disabled={!routePathSelection1 || !routePathSelection2}
                >
                    Vertaile valittuja reitinsuuntia
                </Button>
            </div>
        );
    })
);

export default RoutePathComparisonView;

export { IRoutePathSelection, RoutePathSelection };
