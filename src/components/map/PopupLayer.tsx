import React, { Component } from 'react';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import { Popup } from 'react-leaflet';
import { PopupStore } from '../../stores/popupStore';
import * as s from './popupLayer.scss';
import { INode } from '../../models';
import { SidebarStore } from '../../stores/sidebarStore';

interface PopupLayerProps {
    popupStore?: PopupStore;
    sidebarStore?: SidebarStore;
    setView: Function;
}

@inject('popupStore')
@inject('sidebarStore')
@observer
export default class PopupLayer extends Component<PopupLayerProps> {
    constructor(props: PopupLayerProps) {
        super(props);
    }

    private onClose = () => {
        this.props.popupStore!.closePopup();
    }

    render() {
        if (this.props.popupStore!.popupNode) {
            const node = this.props.popupStore!.popupNode as INode;

            const openNode = () => {
                this.props.sidebarStore!.openNodeView(node.id);
                const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);
                this.props.setView(latLng, 17);
                this.onClose();
            };

            return (
                <Popup
                    position={[node.coordinates.lat, node.coordinates.lon]}
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
        } return null;
    }
}
