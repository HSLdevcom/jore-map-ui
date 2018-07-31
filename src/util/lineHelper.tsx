import * as React from 'react';
import BusIcon from '../icons/icon-bus';
import FerryIcon from '../icons/icon-ferry';
import SubwayIcon from '../icons/icon-subway';
import TrainIcon from '../icons/icon-train';
import TramIcon from '../icons/icon-tram';
import TransitType from '../enums/transitType';

class LineHelper {

    public static parseLineNumber = (lineId: string) => {
        return lineId.substring(1).replace(/^0+/, '');
    }

    public static getTransitIcon = (linjoukkollaji: TransitType, withoutBox: boolean) => {
        switch (linjoukkollaji) {
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

    public static getReiTunnus = (edge: any) => {
        if (!edge || !edge.node.reinimi) {
            return 'Reitillä ei nimeä';
        }
        return edge.node.reinimi;
    }

    public static convertTransitTypeCodeToTransitType = (type: string) => {
        switch (type) {
        case '1':
            return TransitType.BUS;
        case '2':
            return TransitType.SUBWAY;
        case '3':
            return TransitType.TRAM;
        case '4':
            return TransitType.TRAIN;
        case '7':
            return TransitType.FERRY;
        default:
            return TransitType.NOT_FOUND;
        }
    }

}

export default LineHelper;
