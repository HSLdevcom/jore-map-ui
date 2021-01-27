import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React, { useEffect, useState } from 'react';
import Dropdown, { IDropdownItem } from '~/components/controls/Dropdown';
import { ISearchLine } from '~/models/ILine';
import RouteService from '~/services/routeService';
import { toDateString } from '~/utils/dateUtils';
import { createDropdownItemsFromList } from '~/utils/dropdownUtils';
import { IRoutePathSelection } from './RoutePathComparisonView';
import * as s from './routePathComparisonView.scss';

interface IRoutePathSelectorProps {
    lineQueryResult: ISearchLine[];
    lineDropdownItems: IDropdownItem[];
    routePathSelection: IRoutePathSelection;
    setSelectedRoutePath: (routePath: IRoutePathSelection) => void;
}

const RoutePathSelector = inject()(
    observer((props: IRoutePathSelectorProps) => {
        const routePathSelection = props.routePathSelection;
        const [lineId, setLineId] = useState<string | null>(null);
        const [routeId, setRouteId] = useState<string | null>(null);
        const [routePathItem, setRoutePathItem] = useState<string | null>(null);
        const [routeDropdownItems, setRouteDropdownItems] = useState<IDropdownItem[]>([]);
        const [routePathDropdownItems, setRoutePathDropdownItems] = useState<IDropdownItem[]>([]);

        useEffect(() => {
            if (routePathSelection) {
                setLineId(routePathSelection.lineId);
                setRouteId(routePathSelection.routeId);
                setRoutePathItem(
                    routePathSelection.startDate
                        ? _createRoutePathItem({
                              direction: routePathSelection.direction!,
                              startDate: routePathSelection.startDate,
                          })
                        : null
                );
            } else {
                setLineId(null);
                setRouteId(null);
                setRoutePathItem(null);
                setRouteDropdownItems([]);
                setRoutePathDropdownItems([]);
            }
        }, [routePathSelection]);

        useEffect(() => {
            const fetchRoutePathItems = async () => {
                const route = await RouteService.fetchRoute({
                    routeId: routePathSelection.routeId,
                    areRoutePathLinksExcluded: true,
                });
                const routePathDropdownItems: IDropdownItem[] = createDropdownItemsFromList(
                    route!.routePaths.map((rp) =>
                        _createRoutePathItem({ direction: rp.direction, startDate: rp.startDate })
                    )
                );
                setRoutePathDropdownItems(routePathDropdownItems);

                const routeDropdownItems: IDropdownItem[] = createDropdownItemsFromList(
                    props.lineQueryResult
                        .find((s) => s.id === routePathSelection.lineId)!
                        .routes.map((r) => r.id)
                );
                setRouteDropdownItems(routeDropdownItems);
            };
            fetchRoutePathItems();
        }, [routePathItem]);

        const onLineChange = (value: string) => {
            const items: IDropdownItem[] = createDropdownItemsFromList(
                props.lineQueryResult.find((s) => s.id === value)!.routes.map((r) => r.id)
            );
            setLineId(value);
            setRouteDropdownItems(items);
            setRoutePathDropdownItems([]);
            setRouteId(null);
            setRoutePathItem(null);
        };

        const onRouteChange = async (routeId: string) => {
            const route = await RouteService.fetchRoute({
                routeId,
                areRoutePathLinksExcluded: true,
            });
            const items: IDropdownItem[] = createDropdownItemsFromList(
                route!.routePaths.map((rp) =>
                    _createRoutePathItem({ direction: rp.direction, startDate: rp.startDate })
                )
            );
            setRouteId(routeId);
            setRoutePathDropdownItems(items);
            setRoutePathItem(null);
        };

        const onRoutePathItemChange = (routePathItem: string) => {
            setRoutePathItem(routePathItem);
            const [direction, startDate] = routePathItem.split(' ');
            props.setSelectedRoutePath({
                direction,
                lineId: lineId!,
                routeId: routeId!,
                startDate: Moment(startDate, 'DD.MM.YYYY').toDate(),
            });
        };

        return (
            <div>
                <div className={s.flexRow}>
                    <Dropdown
                        label='LINJA'
                        selected={lineId}
                        items={props.lineDropdownItems}
                        onChange={(lineId: string) => onLineChange(lineId)}
                        validationResult={
                            !lineId || lineId.length === 0
                                ? { isValid: false, errorMessage: 'Valitse linja' }
                                : undefined
                        }
                        data-cy='lineDropdown'
                    />
                    <Dropdown
                        label='REITTI'
                        selected={routeId}
                        items={routeDropdownItems}
                        onChange={(routeId: string) => onRouteChange(routeId)}
                        validationResult={
                            !routeId || routeId.length === 0
                                ? { isValid: false, errorMessage: 'Valitse reitti' }
                                : undefined
                        }
                        data-cy='routeDropdown'
                    />
                </div>
                <div className={s.flexRow}>
                    <Dropdown
                        label='REITINSUUNTA'
                        selected={routePathItem}
                        items={routePathDropdownItems}
                        onChange={(routePathItem: string) => onRoutePathItemChange(routePathItem)}
                        validationResult={
                            !routePathItem || routePathItem.length === 0
                                ? { isValid: false, errorMessage: 'Valitse reitinsuunta' }
                                : undefined
                        }
                        data-cy='routePathDropdown'
                    />
                </div>
            </div>
        );
    })
);

// RoutePathItem: startDate + ' ' + direction
const _createRoutePathItem = ({ direction, startDate }: { direction: string; startDate: Date }) => {
    return `${direction} ${toDateString(new Date(startDate))}`;
};

export default RoutePathSelector;
