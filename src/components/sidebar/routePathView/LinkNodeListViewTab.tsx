
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { FaAngleRight } from 'react-icons/fa';
import { IRoutePath, IRoutePathLink } from '~/models';
import NodeType from '~/enums/nodeType';
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

    public getType = (nodeType: string) => {
        switch (nodeType) {
        case NodeType.STOP: {
            return 'Pysäkki';
        }
        case NodeType.CROSSROAD: {
            return 'Risteys';
        }
        case NodeType.DISABLED: {
            return (
                <span className={s.notInUse}>
                    Ei käytössä
                </span>
            );
        }
        default: {
            return '-';
        }
        }
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
                    <div className={s.item}>
                        <div className={s.attributes}>
                            <div className={s.label}>
                                Solmu:
                                <div
                                    className={s.id}
                                >
                                    {link.startNode.id}
                                </div>
                            </div>
                            <div className={s.type}>
                                Tyyppi: {this.getType(link.startNodeType)}
                            </div>
                            {
                                link.isStartNodeTimeAlignmentStop &&
                                <div className={s.timeAlignment}>
                                    Ajantasauspysäkki
                                </div>
                            }
                        </div>
                        <div
                            className={s.itemToggle}
                        >
                            <FaAngleRight />
                        </div>
                    </div>
                    <div className={s.item}>
                        <div className={s.attributes}>
                            <div className={s.label}>
                                Linkki:
                                <div
                                    className={s.id}
                                    onClick={this.onClick}
                                >
                                    {link.id}
                                </div>
                            </div>
                        </div>
                        <div
                            className={s.itemToggle}
                        >
                            <FaAngleRight />
                        </div>
                    </div>
                </div>
            );
        });

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
                    onClick={this.onClick}
                >
                    Tallenna muutokset
                </div>
            </div>
        );
    }
}

export default LinkNodeListView;
