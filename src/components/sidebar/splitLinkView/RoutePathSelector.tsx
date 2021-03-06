import Moment from 'moment';
import * as React from 'react';
import { Checkbox } from '~/components/controls';
import Loader from '~/components/shared/loader/Loader';
import { IRoutePath } from '~/models';
import * as s from './routePathSelector.scss';

interface IRoutePathSelectorProps {
    routePaths: IRoutePath[];
    selectedIds: {};
    isLoading?: boolean;
    toggleIsRoutePathSelected: (routePathId: string) => void;
    selectedDate: Date;
}

const RoutePathSelector = (props: IRoutePathSelectorProps) => {
    const toggleRoutePath = (routePathId: string) => () => {
        props.toggleIsRoutePathSelected(routePathId);
    };

    const renderCheckboxContent = (routePath: IRoutePath) => (
        <div className={s.checkboxContent}>
            <div className={s.contentHeader}>{routePath.routeId}:</div>
            <div className={s.contentDescription}>
                <div>
                    {routePath.originFi} - {routePath.destinationFi}
                </div>
                <div>
                    {Moment(routePath.startDate).format('DD.MM.YYYY')} -{' '}
                    {Moment(routePath.endDate).format('DD.MM.YYYY')}
                </div>
            </div>
        </div>
    );

    if (props.isLoading) {
        return <Loader size='small' />;
    }

    return (
        <div className={s.routePathSelectorView}>
            {props.routePaths.length === 0 && (
                <div>
                    {`Päivämääränä ${Moment(props.selectedDate).format('DD.MM.YYYY')} tai sen
                         jälkeen voimassa olevia reitinsuuntia ei löytynyt.`}
                </div>
            )}
            {props.routePaths.length !== 0 && (
                <div className={s.list}>
                    {props.routePaths.map((rp, index) => (
                        <Checkbox
                            content={renderCheckboxContent(rp)}
                            key={index}
                            checked={props.selectedIds[rp.internalId] || false}
                            onClick={toggleRoutePath(rp.internalId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoutePathSelector;
