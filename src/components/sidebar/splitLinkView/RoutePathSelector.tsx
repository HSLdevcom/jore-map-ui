import * as React from 'react';
import Moment from 'moment';
import { IRoutePath } from '~/models';
import { Checkbox } from '~/components/controls';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
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

    const getCheckboxContent = (routePath: IRoutePath) => (
        <div className={s.checkboxContent}>
            <div className={s.contentHeader}>
            {routePath.routeId}:
            </div>
            <div className={s.contentDescription}>
                <div>{routePath.originFi} - {routePath.destinationFi}</div>
                <div>
                    {Moment(routePath.startTime).format('DD.MM.YYYY')}
                    {' '}-{' '}
                    {Moment(routePath.endTime).format('DD.MM.YYYY')}
                </div>
            </div>
        </div>
    );

    if (props.isLoading) {
        return (
            <div className={s.routePathSelectorView}>
                <div className={s.loader}>
                    <Loader size={LoaderSize.SMALL} />
                </div>
            </div>
        );
    }

    return (
        <div className={s.routePathSelectorView}>
                {props.routePaths.length === 0 &&
                    <div>
                        Päivämäärän {Moment(props.selectedDate).format('DD.MM.YYYY')}
                        jälkeen voimassa olevia reitinsuuntia ei löytynyt.
                    </div>
                }
                {props.routePaths.length !== 0 &&
                    <div className={s.list}>
                        {props.routePaths.map((rp, index) =>
                            <Checkbox
                                content={getCheckboxContent(rp)}
                                key={index}
                                checked={props.selectedIds[rp.internalId]}
                                onClick={toggleRoutePath(rp.internalId)}
                            />)
                        }
                    </div>
                }
        </div>
    );
};

export default RoutePathSelector;
