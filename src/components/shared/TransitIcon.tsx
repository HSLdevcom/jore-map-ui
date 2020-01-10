import React from 'react';
import TransitType from '~/enums/transitType';
import BusIcon from '~/icons/icon-bus';
import FerryIcon from '~/icons/icon-ferry';
import SubwayIcon from '~/icons/icon-subway';
import TrainIcon from '~/icons/icon-train';
import TramIcon from '~/icons/icon-tram';

interface ITransitIconProps {
    transitType: TransitType;
    withoutBox: boolean;
}

export default class TransitIcon extends React.Component<ITransitIconProps> {
    render() {
        const { transitType, withoutBox } = this.props;
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
                throw `Missing icon for transitType: ${transitType}`;
        }
    }
}
