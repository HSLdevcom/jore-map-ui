import * as L from 'leaflet';
import ApiClient, { RequestMethod } from '~/util/ApiClient';
import constants from '~/constants/constants';

type langOptions = 'fi' | 'sv';

interface IAddressFeature {
    geometry: any;
    properties: any;
    type: string;
}

class GeocodingService {
    public static fetchStreetNameFromCoordinates = async (
        coordinates: L.LatLng,
        lang: langOptions
    ): Promise<string> => {
        const requestUrl = `${
            constants.STREET_NAME_REVERSE_GEOCODING_URL
        }?lat=${coordinates.lat}&lon=${
            coordinates.lng
        }&format=geojson&accept-language=${lang}`;

        const response = await ApiClient.sendRequest(
            RequestMethod.GET,
            encodeURI(requestUrl),
            {}
        );

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

    public static fetchPostalNumberFromCoordinates = async (
        coordinates: L.LatLng
    ): Promise<string> => {
        const requestUrl = `${
            constants.POSTAL_NUMBER_REVERSE_GEOCODING_URL
        }?point.lat=${coordinates.lat}&point.lon=${coordinates.lng}`;

        const response = await ApiClient.sendRequest(
            RequestMethod.GET,
            encodeURI(requestUrl),
            {}
        );

        if (
            response &&
            response.features &&
            response.features[0] &&
            response.features[0].properties &&
            response.features[0].properties.postalcode
        ) {
            return response.features[0].properties.postalcode;
        }
        return '';
    };

    public static fetchAddressFeaturesFromString = async (
        value: string,
        coordinates: L.LatLng
    ): Promise<IAddressFeature[]> => {
        const ADDRESS_GEOCODING_URL = constants.ADDRESS_GEOCODING_URL;
        const SEARCH_RESULT_COUNT = constants.ADDRESS_SEARCH_RESULT_COUNT;
        const lat = coordinates.lat;
        const lng = coordinates.lng;
        const requestUrl = `${ADDRESS_GEOCODING_URL}?text=${value}&size=${SEARCH_RESULT_COUNT}&focus.point.lat=${lat}&focus.point.lon=${lng}`;

        const response = await ApiClient.sendRequest(
            RequestMethod.GET,
            encodeURI(requestUrl),
            {}
        );
        return response.features;
    };
}
export default GeocodingService;

export { IAddressFeature };
