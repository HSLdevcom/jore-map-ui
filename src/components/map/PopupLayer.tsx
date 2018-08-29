import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Popup } from 'react-leaflet';
import { PopupStore } from '../../stores/popupStore';
import * as s from './popupLayer.scss';
import { INode } from '../../models';

interface PopupLayerProps {
    popupStore?: PopupStore;
}

@inject('popupStore')
@observer
export default class PopupLayer extends Component<PopupLayerProps> {
    onClose = () => {
        this.props.popupStore!.removePopup();
    }

    render() {
        if (this.props.popupStore!.popupNode) {
            const node = this.props.popupStore!.popupNode as INode;
            return (
                <Popup
                    position={[node.coordinates.lat, node.coordinates.lon]}
                    className={s.leafletPopup}
                    closeButton={false}
                    onClose={this.onClose}
                >
                    <div className={s.popupContainer}>
                        <div>Avaa kohde</div>
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
