
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { IRoutePath, IRoutePathLink } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import s from './routePathLinksTab.scss';
import RoutePathListNode from './RoutePathListNode';
import RoutePathListLink from './RoutePathListLink';

interface IRoutePathLinksTabProps {
    routePathStore?: RoutePathStore;
    routePath: IRoutePath;
}

@inject('routePathStore')
@observer
class RoutePathLinksTab extends React.Component<IRoutePathLinksTabProps>{
    private renderList = (routePathLinks: IRoutePathLink[]) => {
        return routePathLinks.map((routePathLink, index) => {
            return [
                (
                    <RoutePathListNode
                        key={`${routePathLink.id}-${index}-startNode`}
                        node={routePathLink.startNode}
                        routePathLink={routePathLink}
                    />
                ), (
                    <RoutePathListLink
                        key={`${routePathLink.id}-${index}-link`}
                        routePathLink={routePathLink}
                    />
                ), index === routePathLinks.length - 1 && (
                    <RoutePathListNode
                        key={`${routePathLink.id}-${index}-endNode`}
                        node={routePathLink.endNode}
                        routePathLink={routePathLink}
                    />
                ),
            ];
        });
    }

    save = () => {
    }

    public render() {
        const routePathLinks = this.props.routePath.routePathLinks;
        if (!routePathLinks) return null;
        const sortedRoutePathLinks = routePathLinks.sort((a, b) => a.orderNumber - b.orderNumber);

        return (
            <div className={s.routePathLinksView}>
                <div className={s.contentWrapper}>
                    {this.renderList(sortedRoutePathLinks)}
                </div>
                <Button
                    type={ButtonType.SAVE}
                    disabled={true}
                    onClick={this.save}
                >
                    Tallenna muutokset
                </Button>
            </div>
        );
    }
}

export default RoutePathLinksTab;
