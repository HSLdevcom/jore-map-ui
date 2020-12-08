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

const RoutePathListLink = inject(
    'routePathStore',
    'routePathLayerStore',
    'codeListStore',
    'mapStore'
)(
    observer(
        React.forwardRef((props: IRoutePathListLinkProps, ref: React.RefObject<HTMLDivElement>) => {
            const renderHeader = () => {
                const id = props.routePathLink.id;
                const orderNumber = props.routePathLink.orderNumber;
                const isExtended = props.routePathLayerStore!.extendedListItemId === id;
                return (
                    <div
                        className={s.itemHeader}
                        onClick={toggleExtendedListItemId}
                        data-cy='itemHeader'
                    >
                        <div className={s.headerContent}>
                            <div className={s.headerContainer}>Reitinlinkki {orderNumber}</div>
                        </div>
                        <div className={s.itemToggle}>
                            {isExtended && <FaAngleDown />}
                            {!isExtended && <FaAngleRight />}
                        </div>
                    </div>
                );
            };

            const toggleExtendedListItemId = () => {
                const currentListItemId = props.routePathLink.id;
                const routePathLayerStore = props.routePathLayerStore;
                if (currentListItemId === routePathLayerStore!.extendedListItemId) {
                    routePathLayerStore!.setExtendedListItemId(null);
                } else {
                    routePathLayerStore!.setExtendedListItemId(currentListItemId);
                    props.mapStore!.setMapBounds(getBounds());
                }
            };

            const getBounds = () => {
                const geometry = props.routePathStore!.getLinkGeom(props.routePathLink.id);
                const bounds: L.LatLngBounds = new L.LatLngBounds([]);
                geometry.forEach((geom: L.LatLng) => bounds.extend(geom));
                return bounds;
            };

            const renderBody = () => {
                return (
                    <>
                        {renderRoutePathLinkView(props.routePathLink)}
                        <div className={s.footer}>
                            <Button onClick={() => openLinkInNewTab()} type={ButtonType.SQUARE}>
                                Avaa linkki
                                <FiExternalLink />
                            </Button>
                        </div>
                    </>
                );
            };

            const openLinkInNewTab = () => {
                const routeLink = props.routePathLink;
                const linkViewLink = routeBuilder
                    .to(SubSites.link)
                    .toTarget(
                        ':id',
                        [routeLink.startNode.id, routeLink.endNode.id, routeLink.transitType].join(
                            ','
                        )
                    )
                    .toLink();
                window.open(linkViewLink, '_blank');
            };

            const renderRoutePathLinkView = (rpLink: IRoutePathLink) => {
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

            const onMouseEnterLinkIcon = () => {
                props.routePathLayerStore!.setHoveredItemId(props.routePathLink.id);
            };

            const onMouseLeaveLinkIcon = () => {
                if (props.isHovered) {
                    props.routePathLayerStore!.setHoveredItemId(null);
                }
            };

            const onClickLinkIcon = () => {
                const clickParams: IRoutePathLinkClickParams = {
                    routePathLinkId: props.routePathLink.id,
                };
                EventListener.trigger('routePathLinkClick', clickParams);
            };

            const isExtended = props.isExtended;
            const isHovered = props.isHovered;
            return (
                <div ref={ref} className={classnames(s.routePathListItem)}>
                    <div
                        className={s.listIconWrapper}
                        onMouseEnter={onMouseEnterLinkIcon}
                        onMouseLeave={onMouseLeaveLinkIcon}
                        onClick={onClickLinkIcon}
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
                        {renderHeader()}
                        {isExtended && <div className={s.itemContent}>{renderBody()}</div>}
                    </div>
                </div>
            );
        })
    )
);

export default RoutePathListLink;
