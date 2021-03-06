import * as L from 'leaflet';
import React, { Component } from 'react';
import { Marker as LeafletMarker } from 'react-leaflet';
import PinIcon from '~/icons/PinIcon';
import LeafletUtils from '~/utils/leafletUtils';
import * as s from './marker.scss';

interface IMarkerProps {
    latLng: L.LatLng;
    color: string;
    isClickDisabled?: boolean;
    popupContent?: React.ReactNode;
}

// The logic of Z Indexes is not very logical.
// Setting z-index to 2, if other items is 1 wont force it to be on top.
// Setting z-index to a very high number will however most likely set the item on top.
// https://leafletjs.com/reference-1.3.4.html#marker-zindexoffset
const VERY_HIGH_Z_INDEX = 1000;

class Marker extends Component<IMarkerProps> {
    private markerRef: any;

    componentDidUpdate() {
        this.openPopup();
    }

    openPopup = () => {
        if (this.markerRef) {
            this.markerRef.leafletElement.openPopup();
        }
    };

    initMarkerRef = (ref: any) => {
        if (ref) {
            this.markerRef = ref;
            this.openPopup();
        }
    };

    render() {
        const { latLng, color, isClickDisabled }: IMarkerProps = this.props;
        const iconBaseClass = isClickDisabled ? s.iconBaseNotClickable : s.iconBase;

        return (
            <LeafletMarker
                ref={this.initMarkerRef}
                zIndexOffset={VERY_HIGH_Z_INDEX}
                icon={LeafletUtils.createDivIcon({
                    html: <PinIcon color={color} />,
                    options: {
                        classNames: [iconBaseClass],
                    },
                })}
                position={latLng}
                clickable={!isClickDisabled}
            >
                {/* working react-leaflet popup, not currently in use
                { this.props.popupContent &&
                <Popup
                    position={latLng}
                    closeButton={false}
                    minWidth={300}
                >
                    {this.props.popupContent}
                </Popup> */}
            </LeafletMarker>
        );
    }
}

export default Marker;
