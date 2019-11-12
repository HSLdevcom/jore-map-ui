import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Popup } from 'react-leaflet';
import { IPopup, PopupStore } from '~/stores/popupStore';
import * as s from './popupLayer.scss';

interface PopupLayerProps {
    popupStore?: PopupStore;
}

@inject('popupStore')
@observer
class PopupLayer extends Component<PopupLayerProps> {
    private popupRefs: object;

    private closePopup = (popup: IPopup) => () => {
        this.props.popupStore!.closePopup(popup.id!);
    };

    private bringPopupToFront = (id: number) => {
        const popupRef = this.popupRefs[id];
        popupRef.leafletElement.bringToFront();
    };

    render() {
        const popups = this.props.popupStore!.popups;
        if (popups.length === 0) {
            return null;
        }
        this.popupRefs = {};

        return popups.map((popup: IPopup) => {
            return (
                <Popup
                    key={`popup-${popup.id}`}
                    ref={ref => (this.popupRefs[popup.id!] = ref)}
                    autoClose={Boolean(popup.isAutoCloseOn)}
                    position={popup.coordinates}
                    className={s.leafletPopup}
                    closeButton={popup.isCloseButtonVisible}
                    onClose={this.closePopup(popup)}
                >
                    <div
                        key={`popup-${popup.id}`}
                        onClick={() => this.bringPopupToFront(popup.id!)}
                        className={s.popupContentWrapper}
                    >
                        {popup.content(popup.id!)}
                    </div>
                </Popup>
            );
        });
    }
}

export default PopupLayer;
