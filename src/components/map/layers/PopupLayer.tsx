import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Popup, withLeaflet } from 'react-leaflet';
import { PopupStore } from '~/stores/popupStore';
import { INode } from '~/models';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { LeafletContext } from '../Map';
import * as s from './popupLayer.scss';

interface PopupLayerProps {
    popupStore?: PopupStore;
    leaflet: LeafletContext;
}

@inject('popupStore')
@observer
class PopupLayer extends Component<PopupLayerProps> {
    private onClose = () => {
        this.props.popupStore!.closePopup();
    };

    render() {
        if (this.props.popupStore!.popupNode) {
            const node = this.props.popupStore!.popupNode as INode;

            const openNode = () => {
                const map = this.props.leaflet.map;

                map!.setView(node.coordinates, map!.getZoom());
                this.onClose();
                const nodeLink = routeBuilder
                    .to(subSites.node)
                    .toTarget(node.id)
                    .toLink();
                navigator.goTo(nodeLink);
            };

            return (
                <Popup
                    position={node.coordinates}
                    className={s.leafletPopup}
                    closeButton={false}
                    onClose={this.onClose}
                >
                    <div className={s.popupContainer}>
                        <div onClick={openNode}>Avaa kohde</div>
                        <div>Tulosta</div>
                        <div>Poista linkki</div>
                        <div>Lisää linkki</div>
                        <div>Kopioi toiseen suuntaan</div>
                    </div>
                </Popup>
            );
        }
        return null;
    }
}
export default withLeaflet(PopupLayer);
