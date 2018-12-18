
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
    constructor(props: IRoutePathLinksTabProps) {
        super(props);
    }

    private renderList = (routePathLinks: IRoutePathLink[]) => {
        const result = routePathLinks.map((routePathLink) => {
            return (
                <div key={routePathLink.orderNumber}>
                    {this.renderItem(
                        routePathLink, routePathLink.startNode, routePathLink.startNodeType,
                    )}
                    {this.renderItem(routePathLink)}
                </div>
            );
        });
        const lastRoutePathLink = routePathLinks.pop();
        if (lastRoutePathLink) {
            result.push(
                <div key={lastRoutePathLink.endNode.id}>
                {
                    this.renderItem(
                    lastRoutePathLink, lastRoutePathLink.endNode, lastRoutePathLink.endNode.type,
                    )
                }
                </div>,
            );
        }
        return result;
    }

    private renderItem(routePathLink: IRoutePathLink, node?: INode, nodeType?: string) {
        return (
            <div className={s.item}>
                <div className={s.attributes}>
                    { node ?
                        <>
                            {this.renderLabel('Solmu', node.id)}
                            {this.renderNodeDescription(routePathLink, nodeType)}
                        </>
                        :
                            this.renderLabel('Linkki', routePathLink.id)
                    }
                </div>
                <div className={s.itemToggle}>
                    <FaAngleRight />
                </div>
            </div>
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
        if (!routePathLinks) return;
        const sortedRoutePathLinks = routePathLinks.sort((a: IRoutePathLink, b: IRoutePathLink) => {
            const keyA = a.orderNumber;
            const keyB = b.orderNumber;
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });

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
