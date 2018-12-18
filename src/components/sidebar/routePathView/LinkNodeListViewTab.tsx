
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { FaAngleRight } from 'react-icons/fa';
import { IRoutePath, IRoutePathLink } from '~/models';
import NodeType from '~/enums/nodeType';
import NodeDescription from '~/enums/l10n/nodeDescription';
import CommonType from '~/enums/l10n/commonType';
import { RoutePathStore } from '~/stores/routePathStore';
import s from './linkNodeListViewTab.scss';

interface ILinkNodeListViewState {
}

interface ILinkNodeListViewProps {
    routePathStore?: RoutePathStore;
    routePath: IRoutePath;
}

@inject('routePathStore')
@observer
class LinkNodeListView extends React.Component<ILinkNodeListViewProps, ILinkNodeListViewState>{
    constructor(props: ILinkNodeListViewProps) {
        super(props);
    }

    public getNodeType = (nodeType?: string) => {
        switch (nodeType) {
        case NodeType.STOP: {
            return NodeDescription.STOP;
        }
        case NodeType.CROSSROAD: {
            return NodeDescription.CROSSROAD;
        }
        case NodeType.DISABLED: {
            return (
                <span className={s.notInUse}>
                    {NodeDescription.DISABLED}
                </span>
            );
        }
        default: {
            return;
        }
        }
    }

    public getNodeAttributes = (timeAlignment: boolean, nodeType?: string) => {
        return (
            <>
                <div className={s.type}>
                    Tyyppi: {this.getNodeType(nodeType)}
                </div>
                {
                    timeAlignment &&
                    <div className={s.timeAlignment}>
                        Ajantasauspysäkki
                    </div>
                }
            </>
        );
    }

    public getItem = (itemType: string, link: IRoutePathLink) => {
        let label = null;
        let id = null;
        let nodeType = undefined;
        let isStartNodeTimeAlignmentStop = false;

        switch (itemType) {
        case CommonType.START_NODE: {
            label = CommonType.NODE;
            id = link.startNode.id;
            nodeType = link.startNodeType;
            isStartNodeTimeAlignmentStop = link.isStartNodeTimeAlignmentStop;
            break;
        }
        case CommonType.END_NODE: {
            label = CommonType.NODE;
            id = link.endNode.id;
            nodeType = link.endNode.type;
            break;
        }
        case CommonType.LINK: {
            label = CommonType.LINK;
            id = link.id;
            break;
        }
        }
        return (
            <div className={s.item}>
                <div className={s.attributes}>
                    <div className={s.label}>
                        {label}
                        <div
                            className={s.id}
                        >
                            {id}
                        </div>
                    </div>
                    {(label === CommonType.NODE) ?
                        this.getNodeAttributes(
                            isStartNodeTimeAlignmentStop,
                            nodeType) : ''
                    }
                </div>
                <div
                    className={s.itemToggle}
                >
                    <FaAngleRight />
                </div>
            </div>
        );
    }

    public getLastNode = (link?: IRoutePathLink) => {
        if (!link) return;
        return (
            <div
                key={link.endNode.id}
                className={s.linkNodeListViewItem}
            >
                {this.getItem(CommonType.END_NODE, link)}
            </div>
        );
    }

    public getContent = () => {
        const routePathLinks = this.props.routePath.routePathLinks;
        if (!routePathLinks) return;
        const sortedRoutePathLinks = routePathLinks.sort((a: IRoutePathLink, b: IRoutePathLink) => {
            const keyA = a.orderNumber;
            const keyB = b.orderNumber;
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });

        const divs = sortedRoutePathLinks.map((link) => {
            return (
                <div
                    key={link.orderNumber}
                    className={s.linkNodeListViewItem}
                >
                    {this.getItem(CommonType.START_NODE, link)}
                    {this.getItem(CommonType.LINK, link)}
                </div>
            );
        });
        const lastLink = sortedRoutePathLinks.pop();
        const lastNode = this.getLastNode(lastLink);
        if (lastNode) divs.push(lastNode);
        return divs;
    }

    public render(): any {
        return (
            <div className={s.linkNodeListTabView}>
                <div className={s.contentWrapper}>
                    {this.getContent()}
                </div>
                <div
                    className={s.searchResultButton}
                >
                    Tallenna muutokset
                </div>
            </div>
        );
    }
}

export default LinkNodeListView;
