import React from 'react';
import { observer } from 'mobx-react';
import { IRoutePath, INode, IRoutePathLink } from '~/models';
import routeBuilder  from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import NodeType from '~/enums/nodeType';
import nodeTypeCodeList from '~/codeLists/nodeTypeCodeList';
import ButtonType from '~/enums/buttonType';
import { Dropdown, Button } from '../../../controls';
import * as s from './linkListView.scss';

interface ILinkListViewProps {
    routePath: IRoutePath;
}

interface ILinkListViewState {
    selectedRoutePathLink?: string;
    linkTableFilter?: NodeType;
}

@observer
class ILinkListView extends React.Component<ILinkListViewProps, ILinkListViewState>{
    constructor(props: ILinkListViewProps) {
        super(props);
        this.state = {};
    }

    private selectRoutePathLink = (id: string) => () => {
        this.setState({
            selectedRoutePathLink: id,
        });
    }

    private getRoutePathLinks = () => {
        const routePathLinks = this.props.routePath.routePathLinks;
        if (!routePathLinks) return;
        return routePathLinks.map((routePathLink) => {
            if (routePathLink.startNodeType === this.state.linkTableFilter ||
                !this.state.linkTableFilter) {
                return(
                    <div
                        key={routePathLink.id}
                        className={
                            (this.state.selectedRoutePathLink === routePathLink.id)
                            ? s.routePathLinkRowSelected : s.routePathLinkRow}
                        onClick={this.selectRoutePathLink(routePathLink.id)}
                    >
                        <div className={s.flexInnerRow}>
                            <div className={s.tableItemMedium}>
                                {routePathLink.id}
                            </div>

                            <div className={s.tableItem}>
                                {this.getNodeName(routePathLink.startNode)}
                            </div>

                            <div className={s.tableItem}>
                                {this.getNodeName(routePathLink.endNode)}
                            </div>

                            <div className={s.tableItem}>
                                {this.getHastusId(routePathLink)}
                            </div>

                            <div className={s.tableItemSmall}>
                                {routePathLink.startNodeType}
                            </div>
                        </div>
                    </div>);
            }
            return;
        });
    }

    private getHastusId = (routePathLink: IRoutePathLink) => {
        return (routePathLink.startNode.stop && routePathLink.startNode.stop.hastusId) ?
            routePathLink.startNode.stop.hastusId :
            '-';
    }

    private getNodeName = (node: INode) => {
        return (node.stop) ?
            node.stop.nameFi :
            '-';
    }

    private openLinkView = () => {
        if (this.state.selectedRoutePathLink) {
            const linkViewLink =
                routeBuilder
                    .to(subSites.routelink)
                    .toTarget(
                        this.state.selectedRoutePathLink,
                    )
                    .toLink();
            window.open(linkViewLink);
        }
    }

    private getLinkViewButtonTitle = () => {
        const routePathLinkId = this.state.selectedRoutePathLink;
        if (routePathLinkId) {
            return `Avaa linkki (id: ${this.state.selectedRoutePathLink})`;
        }
        return `Ei valittua linkkiä`;
    }

    private noRoutePathLinkSelected = () => {
        return !this.state.selectedRoutePathLink;
    }

    private setLinkTableFilter = (filter: NodeType) => {
        this.setState({
            linkTableFilter: filter,
        });
    }

    render() {
        return (
        <div className={s.linkListView}>
            <div className={s.dropDownFilter}>
                <Dropdown
                    label='Alkusolmutyyppi'
                    selected={this.state.linkTableFilter || '-'}
                    codeList={nodeTypeCodeList}
                    onChange={this.setLinkTableFilter}
                />
            </div>
            <div className={s.columnTitleRow}>
                <div className={s.tableItemMedium}>Linkin id</div>
                <div className={s.tableItem}>Alkusolmu</div>
                <div className={s.tableItem}>Loppusolmu</div>
                <div className={s.tableItem}>Hastus id</div>
                <div className={s.tableItemSmall}>T</div>
            </ div>
            <div className={s.linkList}>
                {this.getRoutePathLinks()}
            </div>
            <Button
                type={ButtonType.SQUARE}
                disabled={this.noRoutePathLinkSelected()}
                onClick={this.openLinkView}
            >
                {this.getLinkViewButtonTitle()}
            </Button>
        </div>
        );
    }
}
export default ILinkListView;
