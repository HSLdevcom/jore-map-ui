import React, { Component } from 'react';
import * as L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import PinIcon from '~/icons/PinIcon';
import LeafletUtils from '~/util/leafletUtils';
import * as s from './startMarker.scss';

interface IStartMarkerProps {
    latLng: L.LatLng;
    color: string;
    popupContent?: any;
}

// The logic of Z Indexes is not very logical.
// Setting z-index to 2, if other items is 1 wont force it to be on top.
// Setting z-index to a very high number will however most likely set the item on top.
// https://leafletjs.com/reference-1.3.4.html#marker-zindexoffset
const VERY_HIGH_Z_INDEX = 1000;

class StartMarker extends Component<IStartMarkerProps> {
    private markerRef: any;

    componentDidUpdate() {
        this.openPopup();
    }

    openPopup = () => {
        if (this.markerRef) {
            this.markerRef.leafletElement.openPopup();
        }
    }

    initMarkerRef = (ref: any) => {
        if (ref) {
            this.markerRef = ref;
            this.openPopup();
        }
    }

    render() {
        const { latLng, color, popupContent }: IStartMarkerProps = this.props;
        return (
            <Marker
                ref={this.initMarkerRef}
                zIndexOffset={VERY_HIGH_Z_INDEX}
                icon={LeafletUtils.createDivIcon(<PinIcon color={color}/>, s.startMarker)}
                position={latLng}
            >
            { popupContent &&
                <Popup
                    position={latLng}
                    closeButton={false}
                    minWidth={300}
                >
                    {popupContent}
                </Popup>
            }
            </Marker>

        );
    }
}

export default StartMarker;
