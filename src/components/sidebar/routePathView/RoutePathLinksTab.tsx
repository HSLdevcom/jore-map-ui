
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { FaAngleRight } from 'react-icons/fa';
import { INode, IRoutePath, IRoutePathLink } from '~/models';
import NodeType from '~/enums/nodeType';
import NodeDescription from '~/enums/l10n/nodeDescription';
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
                <div
                    key={routePathLink.orderNumber}
                    className={s.routePathLinksItem}
                >
                    {this.renderItem(routePathLink, routePathLink.startNode)}
                    {this.renderItem(routePathLink)}
                </div>
            );
        });
        const lastRoutePathLink = routePathLinks.pop();
        if (lastRoutePathLink) {
            result.push(this.renderItem(lastRoutePathLink, lastRoutePathLink.endNode));
        }
        return result;
    }

    private renderItem(routePathLink: IRoutePathLink, node?: INode) {
        return (
            <div className={s.item}>
                <div className={s.attributes}>
                    { node ?
                        <>
                            {this.renderLabel('Solmu', node.id)}
                            {this.renderNodeDescription(routePathLink)}
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

    private renderNodeDescription = (routePathLink: IRoutePathLink) => {
        return (
            <>
                {this.renderNodeTypeDescription(routePathLink.startNodeType)}
                {this.renderTimeAlignmentDescription(routePathLink)}
            </>
        );
    }

    private renderNodeTypeDescription = (nodeType: string) => {
        let className;
        let description;
        switch (nodeType) {
        case NodeType.STOP: {
            description = NodeDescription.STOP;
            break;
        }
        case NodeType.CROSSROAD: {
            description = NodeDescription.CROSSROAD;
            break;
        }
        case NodeType.DISABLED: {
            className = s.notInUse;
            description = NodeDescription.DISABLED;
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
                Ajantasauspysäkki
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
