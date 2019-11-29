import { toJS } from 'mobx';
import Moment from 'moment';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import NodeStore from '~/stores/nodeStore';

// TODO:
// const isNetworkLinkHidden = () => {
// }
// const isNetworkLinkPointHidden = () => {
// }

const isNetworkNodeHidden = (
    nodeId: string,
    transitTypeCodes: string,
    dateRangesString?: string
) => {
    const dateRanges: Moment.Moment[][] | undefined = _parseDateRangesString(dateRangesString);
    const selectedTransitTypes = toJS(NetworkStore.selectedTransitTypes);

    const node = NodeStore.node;
    if (node && node.id === nodeId) {
        return true;
    }

    if (Boolean(transitTypeCodes)) {
        if (!NetworkStore!.isMapLayerVisible(MapLayer.node)) {
            return true;
        }
        const nodeTransitTypes = transitTypeCodes.split(',');
        if (!selectedTransitTypes.some(type => nodeTransitTypes.includes(type))) {
            return true;
        }
    } else {
        if (!NetworkStore.isMapLayerVisible(MapLayer.nodeWithoutLink)) {
            return true;
        }
    }
    const selectedDate = NetworkStore.selectedDate;
    return !selectedDate || !_isDateInRanges(selectedDate, dateRanges);
};

const _parseDateRangesString = (dateRangesString?: string) => {
    if (!dateRangesString) return undefined;
    return dateRangesString.split(',').map((dr: string) => dr.split('/').map(date => Moment(date)));
};

const _isDateInRanges = (
    selectedDate: Moment.Moment | null,
    dateRanges?: Moment.Moment[][]
): Boolean => {
    return selectedDate
        ? !dateRanges || dateRanges.some(dr => selectedDate.isBetween(dr[0], dr[1], 'day', '[]'))
        : true;
};

export { isNetworkNodeHidden };
