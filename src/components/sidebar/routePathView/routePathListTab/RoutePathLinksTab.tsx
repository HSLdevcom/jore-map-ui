
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { FaAngleRight } from 'react-icons/fa';
import { INode, IRoutePath, IRoutePathLink } from '~/models';
import NodeType from '~/enums/nodeType';
import NodeTypeDescription from '~/enums/l10n/nodeTypeDescription';
import { RoutePathStore } from '~/stores/routePathStore';
import s from './routePathLinksTab.scss';

interface IRoutePathLinksTabState {
}

interface IRoutePathLinksTabProps {
    routePathStore?: RoutePathStore;
    routePath: IRoutePath;
}

@inject('routePathStore')
@observer
class RoutePathLinksTab extends React.Component<IRoutePathLinksTabProps, IRoutePathLinksTabState>{
    private renderList = (routePathLinks: IRoutePathLink[]) => {
        return routePathLinks.map((routePathLink, index) => {
            return (
                <div key={routePathLink.orderNumber}>
                    {this.renderNode(routePathLink.startNode, routePathLink)}
                    {this.renderRoutePathLink(routePathLink)}
                    {/* Render last node */}
                    { index === routePathLinks.length - 1 &&
                         this.renderNode(routePathLink.endNode, routePathLink)
                    }
                </div>
            );
        });
    }

    private renderListObject(content: JSX.Element) {
        return (
            <div className={s.item}>
                <div className={s.attributes}>
                    {
                        content
                    }
                </div>
                <div className={s.itemToggle}>
                    <FaAngleRight />
                </div>
            </div>
        );
    }

    private renderRoutePathLink(routePathLink: IRoutePathLink) {
        return this.renderListObject(
            this.renderLabel('Linkki', routePathLink.id),
        );
    }

    private renderNode(node: INode, routePathLink: IRoutePathLink) {
        return this.renderListObject(
            <>
                {this.renderLabel('Solmu', node.id)}
                {this.renderNodeDescription(routePathLink, node.type)}
            </>,
        );
    }

    private renderLabel(label: string, id: string) {
        return (
            <div className={s.label}>
                {label}
                <div className={s.id}>
                    {id}
                </div>
            </div>
        );
    }

    private renderNodeDescription = (routePathLink: IRoutePathLink, nodeType?: string) => {
        return (
            <>
                {this.renderNodeTypeDescription(nodeType)}
                {this.renderTimeAlignmentDescription(routePathLink)}
            </>
        );
    }

    private renderNodeTypeDescription = (nodeType?: string) => {
        let className;
        let description;
        switch (nodeType) {
        case NodeType.STOP: {
            description = NodeTypeDescription.STOP;
            break;
        }
        case NodeType.CROSSROAD: {
            description = NodeTypeDescription.CROSSROAD;
            break;
        }
        case NodeType.DISABLED: {
            className = s.notInUse;
            description = NodeTypeDescription.DISABLED;
            break;
        }
        default: {
            throw new Error(`Node type not supported: ${nodeType}`);
        }}
        return (
            <div className={s.type}>
                Tyyppi: <span className={className}>{description}</span>
            </div>
        );
    }

    private renderTimeAlignmentDescription = (routePathLink: IRoutePathLink) => {
        if (!routePathLink.isStartNodeTimeAlignmentStop) return null;
        return (
            <div className={s.timeAlignment}>
                {NodeTypeDescription.TIME_ALIGNMENT_STOP}
            </div>
        );
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
                <div className={s.saveButton}>
                    Tallenna muutokset
                </div>
            </div>
        );
    }
}

export default RoutePathLinksTab;
