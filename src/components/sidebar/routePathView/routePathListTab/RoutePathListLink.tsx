import * as React from 'react';
import { IRoutePathLink } from '~/models';
import RoutePathListObject, { ListObjectType } from './RoutePathListObject';

interface IRoutePathListLinkProps {
    routePathLink: IRoutePathLink;
    reference: any;
}

class RoutePathListLink
    extends React.Component<IRoutePathListLinkProps> {
    render() {
        return (
            <RoutePathListObject
                reference={this.props.reference}
                headerLabel='Linkki'
                objectType={ListObjectType.Link}
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
