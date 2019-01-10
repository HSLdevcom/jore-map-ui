
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
            return (
                <div key={routePathLink.orderNumber}>
                    <RoutePathListNode
                        node={routePathLink.startNode}
                        routePathLink={routePathLink}
                    />
                    <RoutePathListLink
                        routePathLink={routePathLink}
                    />
                    {/* Render last node */}
                    { index === routePathLinks.length - 1 &&
                        <RoutePathListNode
                            node={routePathLink.endNode}
                            routePathLink={routePathLink}
                        />
                    }
                </div>
            );
        });
    }

    save = () => {
    }

    public render(): any {
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
