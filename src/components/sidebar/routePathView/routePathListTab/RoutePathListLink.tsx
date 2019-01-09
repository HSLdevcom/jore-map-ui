import * as React from 'react';
import { IRoutePathLink } from '~/models';
import RoutePathListObject from './RoutePathListObject';

interface IRoutePathListLinkProps {
    routePathLink: IRoutePathLink;
}

class RoutePathListLink
    extends React.Component<IRoutePathListLinkProps> {
    render() {
        return (
            <RoutePathListObject
                headerLabel='Linkki'
                id={this.props.routePathLink.id}
            >
                <div>
                    Linkin lisätiedot
                </div>
            </RoutePathListObject>
        );
    }
}

export default RoutePathListLink;
