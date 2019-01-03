import * as React from 'react';
import { observer } from 'mobx-react';
import { IRoutePath, INode, IRoutePathLink } from '~/models';
import routeBuilder  from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import NodeType from '~/enums/nodeType';
import ButtonType from '~/enums/buttonType';
import { Dropdown, Button } from '../../../controls';
import * as s from './linkListView.scss';

interface ILinkListViewProps {
    routePath: IRoutePath;
}

interface ILinkListViewState {
    selectedRoutePathLink?: string;
    linkTableFilter: string;
}

const filterTypes = {
    STOPS: 'Pysäkki',
    DISABLED: 'Pysäkki, joka ei ole käytössä',
    CROSSROAD: 'Risteys',
    BORDER: 'Raja',
    ALL: 'Näytä kaikki',
};

@observer
class ILinkListView extends React.Component<ILinkListViewProps, ILinkListViewState>{
    constructor(props: ILinkListViewProps) {
        super(props);
        this.state = {
            linkTableFilter:  NodeType.STOP,
        };
    }

    public selectRoutePathLink = (id: string) =>
    () => {
        this.setState({
            selectedRoutePathLink: id,
        });
    }

    private getRoutePathLinks = () => {
        const routePathLinks = this.props.routePath.routePathLinks;
        if (!routePathLinks) return;
        return routePathLinks.map((routePathLink) => {
            if (routePathLink.startNodeType === this.state.linkTableFilter ||
                this.state.linkTableFilter === filterTypes.ALL) {
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

    public getHastusId = (routePathLink: IRoutePathLink) => {
        return (routePathLink.startNode.stop && routePathLink.startNode.stop.hastusId) ?
            routePathLink.startNode.stop.hastusId :
            '-';
    }

    public getNodeName = (node: INode) => {
        return (node.stop) ?
            node.stop.nameFi :
            '-';
    }

    public openLinkView = () => {
        if (this.state.selectedRoutePathLink) {
            const linkViewLink =
                routeBuilder
                    .to(subSites.link)
                    .toTarget(
                        this.state.selectedRoutePathLink,
                    )
                    .toLink();
            window.open(linkViewLink);
        }
    }

    public getLinkViewButtonTitle = () => {
        const routePathLinkId = this.state.selectedRoutePathLink;
        if (routePathLinkId) {
            return `Avaa linkki (id: ${this.state.selectedRoutePathLink})`;
        }
        return `Ei valittua linkkiä`;
    }

    public noRoutePathLinkSelected = () => {
        return !this.state.selectedRoutePathLink;
    }

    public setLinkTableFilter = (filter: string) => {
        let filterType = 'P';
        switch (filter) {
        case filterTypes.STOPS: {
            filterType = NodeType.STOP;
            break;
        }
        case filterTypes.DISABLED: {
            filterType = NodeType.DISABLED;
            break;
        }
        case filterTypes.CROSSROAD: {
            filterType = NodeType.CROSSROAD;
            break;
        }
        case filterTypes.BORDER: {
            filterType = NodeType.MUNICIPALITY_BORDER;
            break;
        }
        case filterTypes.ALL: {
            filterType = filterTypes.ALL;
            break;
        }
        default: {
            filterType = filterTypes.ALL;
            break;
        }
        }
        this.setState({
            linkTableFilter: filterType,
        });
    }

    public render(): any {
        return (
        <div className={s.linkListView}>
            <div className={s.dropDownFilter}>
                <Dropdown
                    label='Alkusolmutyyppi'
                    selected='Pysäkki'
                    items={[
                        filterTypes.STOPS,
                        filterTypes.DISABLED,
                        filterTypes.CROSSROAD,
                        filterTypes.BORDER,
                        filterTypes.ALL,
                    ]}
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
                text={this.getLinkViewButtonTitle()}
                disabled={this.noRoutePathLinkSelected()}
                onClick={this.openLinkView}
            />
        </div>
        );
    }
}
export default ILinkListView;
