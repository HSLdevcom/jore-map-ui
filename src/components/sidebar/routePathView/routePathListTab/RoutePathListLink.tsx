import classnames from 'classnames';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import EventListener, { IRoutePathLinkClickParams } from '~/helpers/EventListener';
import IRoutePathLink from '~/models/IRoutePathLink';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { CodeListStore } from '~/stores/codeListStore';
import { MapStore } from '~/stores/mapStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathStore } from '~/stores/routePathStore';
import TextContainer from '../../../controls/TextContainer';
import * as s from './routePathListItem.scss';

interface IRoutePathListLinkProps {
    isExtended: boolean;
    isHovered: boolean;
    routePathLink: IRoutePathLink;
    routePathStore?: RoutePathStore;
    routePathLayerStore?: RoutePathLayerStore;
    codeListStore?: CodeListStore;
    mapStore?: MapStore;
}

@inject('routePathStore', 'routePathLayerStore', 'codeListStore', 'mapStore')
@observer
class RoutePathListLink extends React.Component<IRoutePathListLinkProps> {
    private renderHeader = () => {
        const id = this.props.routePathLink.id;
        const orderNumber = this.props.routePathLink.orderNumber;
        const isExtended = this.props.routePathLayerStore!.extendedListItemId === id;
        return (
            <div
                className={s.itemHeader}
                onClick={this.toggleExtendedListItemId}
                data-cy='itemHeader'
            >
                <div className={classnames(s.headerSubtopicContainer, s.smallFontSize)}>
                    Reitinlinkki {orderNumber}
                </div>
                <div className={s.headerContent}>
                    <div className={s.itemToggle}>
                        {isExtended && <FaAngleDown />}
                        {!isExtended && <FaAngleRight />}
                    </div>
                </div>
            </div>
        );
    };

    private toggleExtendedListItemId = () => {
        const currentListItemId = this.props.routePathLink.id;
        const routePathLayerStore = this.props.routePathLayerStore;
        if (currentListItemId === routePathLayerStore!.extendedListItemId) {
            routePathLayerStore!.setExtendedListItemId(null);
        } else {
            routePathLayerStore!.setExtendedListItemId(currentListItemId);
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

    private onMouseEnterLinkIcon = () => {
        this.props.routePathLayerStore!.setHoveredItemId(this.props.routePathLink.id);
    };

    private onMouseLeaveLinkIcon = () => {
        if (this.props.isHovered) {
            this.props.routePathLayerStore!.setHoveredItemId(null);
        }
    };

    private onClickLinkIcon = () => {
        const clickParams: IRoutePathLinkClickParams = {
            routePathLinkId: this.props.routePathLink.id,
        };
        EventListener.trigger('routePathLinkClick', clickParams);
    };
    render() {
        const isExtended = this.props.isExtended;
        const isHovered = this.props.isHovered;
        return (
            <div className={classnames(s.routePathListItem)}>
                <div
                    className={s.listIconWrapper}
                    onMouseEnter={this.onMouseEnterLinkIcon}
                    onMouseLeave={this.onMouseLeaveLinkIcon}
                    onClick={this.onClickLinkIcon}
                >
                    <div
                        className={classnames(
                            s.borderContainer,
                            isHovered
                                ? s.hoveredIconHighlight
                                : isExtended
                                ? s.extendedIconHighlight
                                : undefined
                        )}
                        data-cy='rpListLink'
                    >
                        <div className={s.borderLeft} />
                        <div />
                    </div>
                </div>
                <div className={s.contentWrapper}>
                    {this.renderHeader()}
                    {isExtended && <div className={s.itemContent}>{this.renderBody()}</div>}
                </div>
            </div>
        );
    }
}

export default RoutePathListLink;
