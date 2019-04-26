import * as React from 'react';
import { IRoutePath } from '~/models';
import { Checkbox } from '~/components/controls';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import * as s from './routePathSelector.scss';

interface IRoutePathSelectorProps {
    routePaths: IRoutePath[];
    selectedIds: string[];
    isLoading?: boolean;
    toggleIsRoutePathSelected: (routePathId: string) => void;
}

const RoutePathSelector = (props: IRoutePathSelectorProps) => {
    const toggleRoutePath = (routePathId: string) => () => {
        props.toggleIsRoutePathSelected(routePathId);
    };

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
                <div>Ei löytänyt reitinsuuntia</div>
            }
            {props.routePaths.map((rp, index) =>
                <Checkbox
                    text={`${rp.routeId}: ${rp.originFi} - ${rp.destinationFi}`}
                    key={index}
                    checked={props.selectedIds.includes(rp.internalId)}
                    onClick={toggleRoutePath(rp.internalId)}
                />)
            }
        </div>
    );
};

export default RoutePathSelector;
