import { forOwn, omit } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import propertyCodeLists from '~/codeLists/propertyCodeLists';
import { IRoutePath } from '~/models';
import { RoutePathComparisonStore } from '~/stores/routePathComparisonStore';
import ComparableRow, { getAreValuesEqual } from './ComparableRow';
import * as s from './routePathComparisonContainer.scss';

interface IRoutePathComparisonContainerProps {
    routePath1: IRoutePath;
    routePath2: IRoutePath;
    routePathComparisonStore?: RoutePathComparisonStore;
}

const excludedRoutePathProperties = [
    'lineId',
    'routeId',
    'direction',
    'startDate',
    'routePathLinks',
    'modifiedOn',
    'modifiedBy',
] as const;

interface IComparableRoutePath
    extends Omit<
        IRoutePath,
        | 'lineId'
        | 'routeId'
        | 'direction'
        | 'startDate'
        | 'routePathLinks'
        | 'modifiedOn'
        | 'modifiedBy'
    > {}

const RoutePathComparisonContainer = inject('routePathComparisonStore')(
    observer((props: IRoutePathComparisonContainerProps) => {
        const [areEqualPropertiesVisible, setEqualPropertiesVisible] = useState<boolean>(false);
        const rp1: IComparableRoutePath = omit(props.routePath1, excludedRoutePathProperties);
        const rp2: IComparableRoutePath = omit(props.routePath2, excludedRoutePathProperties);
        useEffect(() => {
            props.routePathComparisonStore!.setRoutePath1(props.routePath1);
            props.routePathComparisonStore!.setRoutePath2(props.routePath2);
            return () => {
                props.routePathComparisonStore!.clear();
            };
        }, []);
        const renderRoutePathDifference = () => {
            const rows: any = [];
            let index: number = 0;
            forOwn(rp1, (value1, key) => {
                const value2 = rp2[key];
                const areValuesEqual = getAreValuesEqual(value1, value2);
                if (areEqualPropertiesVisible || !areValuesEqual) {
                    rows.push(
                        <ComparableRow
                            key={`row-${index}`}
                            label={propertyCodeLists['routePath'][key]}
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
                    <div
                        className={s.hideEqualInformationButton}
                        onClick={() => setEqualPropertiesVisible(!areEqualPropertiesVisible)}
                    >
                        {areEqualPropertiesVisible ? 'Piilota samat tiedot' : 'Näytä samat tiedot'}
                    </div>
                </div>
                <div>{renderRoutePathDifference()}</div>
                <div className={s.subTopic}>Pysäkkien tiedot</div>
            </div>
        );
    })
);

export default RoutePathComparisonContainer;
