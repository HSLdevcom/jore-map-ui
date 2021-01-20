import { forOwn, pick } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import propertyCodeLists from '~/codeLists/propertyCodeLists';
import { IRoutePath } from '~/models';
import { RoutePathComparisonStore } from '~/stores/routePathComparisonStore';
import ComparableRow, { getAreValuesEqual } from './ComparableRow';
import NodeDifferencesVisualizer from './NodeDifferencesVisualizer';
import * as s from './routePathComparisonContainer.scss';

interface IRoutePathComparisonContainerProps {
    routePath1: IRoutePath;
    routePath2: IRoutePath;
    routePathComparisonStore?: RoutePathComparisonStore;
}

interface IComparableRoutePath
    extends Pick<
        IRoutePath,
        | 'nameFi'
        | 'nameSw'
        | 'originFi'
        | 'destinationFi'
        | 'originSw'
        | 'destinationSw'
        | 'shortNameFi'
        | 'shortNameSw'
        | 'length'
        | 'exceptionPath'
    > {}

const comparableRoutePathProperties = [
    'nameFi',
    'nameSw',
    'originFi',
    'destinationFi',
    'originSw',
    'destinationSw',
    'shortNameFi',
    'shortNameSw',
    'length',
    'exceptionPath',
] as const;

const RoutePathComparisonContainer = inject('routePathComparisonStore')(
    observer((props: IRoutePathComparisonContainerProps) => {
        const { routePath1, routePath2 } = props;
        const [areEqualPropertiesVisible, setEqualPropertiesVisible] = useState<boolean>(false);
        const [areCrossroadsVisible, setCrossroadsVisible] = useState<boolean>(false);
        const comparableRp1: IComparableRoutePath = pick(routePath1, comparableRoutePathProperties);
        const comparableRp2: IComparableRoutePath = pick(routePath2, comparableRoutePathProperties);

        useEffect(() => {
            props.routePathComparisonStore!.setRoutePath1(routePath1);
            props.routePathComparisonStore!.setRoutePath2(routePath2);
            return () => {
                props.routePathComparisonStore!.clear();
            };
        }, []);
        const renderRoutePathDifference = () => {
            const rows: any = [];
            let index: number = 0;

            const _getValue = (value: any, property: string) => {
                if (property === 'exceptionPath') {
                    return value === '0' ? 'Ei' : 'Kyllä';
                }
                return value;
            };

            forOwn(comparableRp1, (rawValue1: any, property: string) => {
                const value1 = _getValue(rawValue1, property);
                const rawValue2 = comparableRp2[property];
                const value2 = _getValue(rawValue2, property);
                const areValuesEqual = getAreValuesEqual(value1, value2);
                if (areEqualPropertiesVisible || !areValuesEqual) {
                    rows.push(
                        <ComparableRow
                            key={`row-${index}`}
                            label={propertyCodeLists['routePath'][property]}
                            value1={value1}
                            value2={value2}
                        />
                    );
                }
                index += 1;
            });
            return rows.length > 0 ? (
                rows
            ) : (
                <div className={s.noResults}>Ei näytettäviä tietoja.</div>
            );
        };

        return (
            <div className={s.routePathComparisonContainer}>
                <div className={s.firstSubTopicContainer}>
                    <div className={s.subTopic}>Reitinsuuntien tiedot</div>
                    <div className={s.toggleButtonContainer}>
                        <div
                            className={s.toggleButton}
                            onClick={() => setEqualPropertiesVisible(!areEqualPropertiesVisible)}
                        >
                            {areEqualPropertiesVisible
                                ? 'Piilota samat tiedot'
                                : 'Näytä samat tiedot'}
                        </div>
                        <div
                            className={s.toggleButton}
                            onClick={() => setCrossroadsVisible(!areCrossroadsVisible)}
                        >
                            {areCrossroadsVisible ? 'Piilota risteykset' : 'Näytä risteykset'}
                        </div>
                    </div>
                </div>
                <div className={s.differencesContainer}>{renderRoutePathDifference()}</div>
                <div className={s.subTopic}>Solmujen tiedot</div>
                <div>
                    <NodeDifferencesVisualizer
                        routePath1={props.routePath1}
                        routePath2={props.routePath2}
                        areEqualPropertiesVisible={areEqualPropertiesVisible}
                        areCrossroadsVisible={areCrossroadsVisible}
                    />
                </div>
            </div>
        );
    })
);

export default RoutePathComparisonContainer;
