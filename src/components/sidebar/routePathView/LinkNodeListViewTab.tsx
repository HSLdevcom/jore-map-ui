
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { FiEdit } from 'react-icons/fi';
import { IRoutePath, IRoutePathLink, INode } from '~/models';
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

    public onClick = () => {
    }

    public getNodeItem = (label: string, node: INode) => {
        return (
            <div className={s.nodeItem}>
                {label}
                <div className={s.nodeAttribute}>
                    Id:
                    <div
                        className={s.itemId}
                        onClick={this.onClick}
                    >
                        {node.id}
                    </div>
                    <div className={s.editButton}>
                        <FiEdit />
                    </div>
                </div>
                <div className={s.nodeAttribute}>
                    Tyyppi: {node.type}
                </div>
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
                    {this.getNodeItem('Alkusolmu', link.startNode)}
                    <div className={s.linkItem}>
                        Linkki:
                        <div
                            className={s.itemId}
                            onClick={this.onClick}
                        >
                            {link.id}
                        </div>
                        <div className={s.editButton}>
                            <FiEdit />
                        </div>
                    </div>
                    {this.getNodeItem('Loppusolmu', link.endNode)}
                </div>
            );
        });

        return divs;
    }

    public render(): any {
        return (
            <div className={s.linkNodeListViewTabView}>
                <div className={s.contentWrapper}>
                    {this.getContent()}
                </div>
                <div
                    className={s.searchResultButton}
                    onClick={this.onClick}
                >
                    Tallenna muutokset
                </div>
            </div>
        );
    }
}

export default LinkNodeListView;
