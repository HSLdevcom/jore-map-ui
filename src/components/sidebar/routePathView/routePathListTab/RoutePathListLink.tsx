import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { IRoutePathLink, INode } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import RoutePathListObject, { ListObjectType } from './RoutePathListObject';
import * as s from './routePathListObject.scss';

interface IRoutePathListLinkProps {
    routePathStore?: RoutePathStore;
    previousNode?: INode;
    routePathLink: IRoutePathLink;
    nextNode?: INode;
}

@observer
@inject('routePathStore')
class RoutePathListLink
    extends React.Component<IRoutePathListLinkProps> {

    private renderNodeHeaderIcon = () => <div className={s.linkIcon} />;

    render() {
        return (
            <RoutePathListObject
                objectType={ListObjectType.Link}
                id={this.props.routePathLink.id}
                headerIcon={this.renderNodeHeaderIcon()}
                headerTypeName='Linkki'
            >
                <div>
                    Linkin lisätiedot
                </div>
            </RoutePathListObject>
        );
    }
}

export default RoutePathListLink;
