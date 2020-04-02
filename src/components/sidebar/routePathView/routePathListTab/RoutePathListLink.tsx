import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import IRoutePathLink from '~/models/IRoutePathLink';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { CodeListStore } from '~/stores/codeListStore';
import { MapStore } from '~/stores/mapStore';
import { RoutePathStore } from '~/stores/routePathStore';
import TextContainer from '../../../controls/TextContainer';
import RoutePathListItem from './RoutePathListItem';
import * as s from './routePathListItem.scss';

interface IRoutePathListLinkProps {
    routePathLink: IRoutePathLink;
    mapStore?: MapStore;
    routePathStore?: RoutePathStore;
    codeListStore?: CodeListStore;
}

@inject('routePathStore', 'codeListStore', 'mapStore')
@observer
class RoutePathListLink extends React.Component<IRoutePathListLinkProps> {
    private renderHeader = () => {
        const id = this.props.routePathLink.id;
        const orderNumber = this.props.routePathLink.orderNumber;
        const isExtended = this.props.routePathStore!.isListItemExtended(id);
        return (
            <div className={s.itemHeader} onClick={this.toggleIsExtended} data-cy='itemHeader'>
                <div className={s.headerSubtopicContainer}>Reitinlinkki {orderNumber}</div>
                <div className={s.headerContent}>
                    <div className={s.itemToggle}>
                        {isExtended && <FaAngleDown />}
                        {!isExtended && <FaAngleRight />}
                    </div>
                </div>
            </div>
        );
    };

    private toggleIsExtended = () => {
        this.props.routePathStore!.toggleExtendedListItem(this.props.routePathLink.id);

        if (this.props.routePathStore!.isListItemExtended(this.props.routePathLink.id)) {
            this.props.mapStore!.setMapBounds(this.getBounds());
        }
    };

    private getBounds = () => {
        const geometry = this.props.routePathStore!.getLinkGeom(this.props.routePathLink.id);
        const bounds: L.LatLngBounds = new L.LatLngBounds([]);
        geometry.forEach((geom: L.LatLng) => bounds.extend(geom));
        return bounds;
    };

    private renderBody = () => {
        return (
            <>
                {this.renderRoutePathLinkView(this.props.routePathLink)}
                <div className={s.footer}>
                    <Button onClick={() => this.openLinkInNewTab()} type={ButtonType.SQUARE}>
                        Avaa linkki
                        <FiExternalLink />
                    </Button>
                </div>
            </>
        );
    };

    private openLinkInNewTab = () => {
        const routeLink = this.props.routePathLink;
        const linkViewLink = routeBuilder
            .to(SubSites.link)
            .toTarget(
                ':id',
                [routeLink.startNode.id, routeLink.endNode.id, routeLink.transitType].join(',')
            )
            .toLink();
        window.open(linkViewLink, '_blank');
    };

    private renderRoutePathLinkView = (rpLink: IRoutePathLink) => {
        return (
            <div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='ALKUSOLMU'
                        value={rpLink.startNode.id}
                        isInputLabelDarker={true}
                    />
                    <TextContainer
                        label='LOPPUSOLMU'
                        value={rpLink.endNode.id}
                        isInputLabelDarker={true}
                    />
                </div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='JÄRJESTYSNUMERO'
                        value={rpLink.orderNumber.toString()}
                        isInputLabelDarker={true}
                    />
                </div>
            </div>
        );
    };

    render() {
        return (
            <RoutePathListItem
                id={this.props.routePathLink.id}
                header={this.renderHeader()}
                body={this.renderBody()}
            />
        );
    }
}

export default RoutePathListLink;
