import React from 'react';
import TransitType from '~/enums/transitType';
import BusIcon from '~/icons/icon-bus';
import FerryIcon from '~/icons/icon-ferry';
import SubwayIcon from '~/icons/icon-subway';
import TrainIcon from '~/icons/icon-train';
import TramIcon from '~/icons/icon-tram';
import ErrorIcon from '~/icons/icon-error';

interface ITransitIconProps {
    transitType: TransitType;
    isWithoutBox: boolean;
}

export default class TransitIcon extends React.Component<ITransitIconProps> {
    render() {
        const { transitType, isWithoutBox } = this.props;
        switch (transitType) {
            case TransitType.BUS:
                return <BusIcon height='24' isWithoutBox={isWithoutBox} />;
            case TransitType.SUBWAY:
                return <SubwayIcon height='24' isWithoutBox={isWithoutBox} />;
            case TransitType.TRAM:
                return <TramIcon height='24' isWithoutBox={isWithoutBox} />;
            case TransitType.TRAIN:
                return <TrainIcon height='24' isWithoutBox={isWithoutBox} />;
            case TransitType.FERRY:
                return <FerryIcon height='24' isWithoutBox={isWithoutBox} />;
            default:
                return <ErrorIcon height='24' isWithoutBox={isWithoutBox} />;
        }
    }
}
