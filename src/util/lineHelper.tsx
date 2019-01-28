import React from 'react';
import BusIcon from '~/icons/icon-bus';
import FerryIcon from '~/icons/icon-ferry';
import SubwayIcon from '~/icons/icon-subway';
import TrainIcon from '~/icons/icon-train';
import TramIcon from '~/icons/icon-tram';
import TransitType from '~/enums/transitType';

class LineHelper {
    public static getTransitIcon = (transitType: TransitType, withoutBox: boolean) => {
        switch (transitType) {
        case TransitType.BUS:
            return <BusIcon height={'24'} withoutBox={withoutBox}/>;
        case TransitType.SUBWAY:
            return <SubwayIcon height={'24'} withoutBox={withoutBox}/>;
        case TransitType.TRAM:
            return <TramIcon height={'24'} withoutBox={withoutBox}/>;
        case TransitType.TRAIN:
            return <TrainIcon height={'24'} withoutBox={withoutBox}/>;
        case TransitType.FERRY:
            return <FerryIcon height={'24'} withoutBox={withoutBox}/>;
        default:
            return <div>puuttuu</div>;
        }
    }
}

export default LineHelper;
