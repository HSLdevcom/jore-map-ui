import { toJS } from 'mobx';
import Moment from 'moment';
import TransitType from '~/enums/transitType';
import LinkStore from '~/stores/linkStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import NodeStore from '~/stores/nodeStore';

type NetworkElementType = MapLayer.link | MapLayer.linkPoint;

const isNetworkElementHidden = ({
    type,
    transitType,
    startNodeId,
    endNodeId,
    dateRangesString
}: {
    type: NetworkElementType;
    transitType: TransitType;
    startNodeId: string;
    endNodeId: string;
    dateRangesString: string;
}) => {
    const dateRanges = _parseDateRangesString(dateRangesString);
    const selectedTransitTypes = NetworkStore.selectedTransitTypes;
    const selectedDate = NetworkStore.selectedDate;
    const link = LinkStore.link;
    const node = NodeStore.node;

    if (type === MapLayer.link && !NetworkStore!.isMapLayerVisible(MapLayer.link)) {
        return true;
    }
    if (type === MapLayer.linkPoint && !NetworkStore!.isMapLayerVisible(MapLayer.linkPoint)) {
        return true;
    }

    // the element is related to an opened link
    const isLinkOpen =
        link &&
        link.startNode.id === startNodeId &&
        link.endNode.id === endNodeId &&
        link.transitType === transitType;

    // the element is related to a link that is related to an opened node
    const isLinkRelatedToOpenedNode = node && (node.id === startNodeId || node.id === endNodeId);

    return (
        !selectedTransitTypes.includes(transitType) ||
        !_isDateInRanges(selectedDate, dateRanges) ||
        isLinkOpen ||
        isLinkRelatedToOpenedNode
    );
};

const isNetworkNodeHidden = ({
    nodeId,
    transitTypeCodes,
    dateRangesString
}: {
    nodeId: string;
    transitTypeCodes: string;
    dateRangesString?: string;
}) => {
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

export { isNetworkElementHidden, isNetworkNodeHidden };
