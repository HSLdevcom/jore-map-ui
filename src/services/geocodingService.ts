import * as L from 'leaflet';
import constants from '~/constants/constants';
import HttpUtils, { RequestMethod } from '~/utils/HttpUtils';

type langOptions = 'fi' | 'sv';

interface IGeoJSONFeature {
    geometry: any;
    properties: any;
    type: string;
}

class GeocodingService {
    public static fetchStreetNameFromCoordinates = async (
        coordinates: L.LatLng,
        lang: langOptions
    ): Promise<string> => {
        const requestUrl = `${constants.OSM_REVERSE_GEOCODING_URL}?lat=${coordinates.lat}&lon=${coordinates.lng}&format=geojson&accept-language=${lang}`;

        const response = await HttpUtils.sendRequest(RequestMethod.GET, encodeURI(requestUrl), {});

        if (
            response &&
            response.features &&
            response.features[0] &&
            response.features[0].properties &&
            response.features[0].properties.address
        ) {
            return response.features[0].properties.address.road;
        }
        return '';
    };

    public static makeDigitransitReverseGeocodingRequest = async ({
        coordinates,
        searchResultCount,
    }: {
        coordinates: L.LatLng;
        searchResultCount: number;
    }): Promise<IGeoJSONFeature[] | null> => {
        const requestUrl = `${constants.DIGITRANSIT_REVERSE_GEOCODING_URL}?digitransit-subscription-key=${constants.DIGITRANSIT_API_KEY}&size=${searchResultCount}&point.lat=${coordinates.lat}&point.lon=${coordinates.lng}&zones=1`;

        const response = await HttpUtils.sendRequest(RequestMethod.GET, encodeURI(requestUrl), {});
        return response.features;
    };

    public static fetchAddressFeaturesFromString = async (
        value: string,
        coordinates: L.LatLng
    ): Promise<IGeoJSONFeature[]> => {
        const GEOCODING_URL = constants.GEOCODING_URL;
        const DIGITRANSIT_API_KEY = constants.DIGITRANSIT_API_KEY;
        const SEARCH_RESULT_COUNT = constants.ADDRESS_SEARCH_RESULT_COUNT;
        const lat = coordinates.lat;
        const lng = coordinates.lng;
        const requestUrl = `${GEOCODING_URL}?digitransit-subscription-key=${DIGITRANSIT_API_KEY}&text=${value}&size=${SEARCH_RESULT_COUNT}&focus.point.lat=${lat}&focus.point.lon=${lng}`;

        const response = await HttpUtils.sendRequest(RequestMethod.GET, encodeURI(requestUrl), {});
        return response.features;
    };
}
export default GeocodingService;

export { IGeoJSONFeature };
