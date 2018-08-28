import React, { Component } from 'react';
import { INode } from '../../models';
import { Popup } from 'react-leaflet';
import * as s from './popupLayer.scss';

interface PopupLayerProps {
    node?: INode;
}

export default class PopupLayer extends Component<PopupLayerProps> {
    render() {
        if (this.props.node) {
            return (
                <Popup
                    position={[this.props.node.coordinates.lat, this.props.node.coordinates.lon]}
                    className={s.leafletPopup}
                    closeButton={false}
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
