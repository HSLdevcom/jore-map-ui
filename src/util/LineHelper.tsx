import React from 'react';
import TransitType from '~/enums/transitType';
import BusIcon from '~/icons/icon-bus';
import FerryIcon from '~/icons/icon-ferry';
import SubwayIcon from '~/icons/icon-subway';
import TrainIcon from '~/icons/icon-train';
import TramIcon from '~/icons/icon-tram';

class LineHelper {
    // TODO: move into TransitTypeHelper(?)
    // TODO: change params as object
    // TOOD: rename withoutBox as "type color: white | blue (default)"
    public static getTransitIcon = (transitType: TransitType, withoutBox: boolean) => {
        switch (transitType) {
            case TransitType.BUS:
                return <BusIcon height='24' withoutBox={withoutBox} />;
            case TransitType.SUBWAY:
                return <SubwayIcon height='24' withoutBox={withoutBox} />;
            case TransitType.TRAM:
                return <TramIcon height='24' withoutBox={withoutBox} />;
            case TransitType.TRAIN:
                return <TrainIcon height='24' withoutBox={withoutBox} />;
            case TransitType.FERRY:
                return <FerryIcon height='24' withoutBox={withoutBox} />;
            default:
                return <div>puuttuu</div>;
        }
    };
}

export default LineHelper;
