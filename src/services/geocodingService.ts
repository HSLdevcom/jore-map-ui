import * as L from 'leaflet';
import ApiClient, { RequestMethod } from '~/util/ApiClient';
import constants from '~/constants/constants';

type langOptions = 'fi' | 'sv';

interface IAddressData {
    address: string;
    postalNumber: string;
}

interface IAddressFeature {
    geometry: any;
    properties: any;
    type: string;
}

class GeocodingService {
    public static fetchAddressDataFromCoordinates = async (
        coordinates: L.LatLng,
        lang: langOptions
    ): Promise<IAddressData> => {
        const requestUrl = `${constants.REVERSE_GEOCODING_URL}?lat=${coordinates.lat}&lon=${coordinates.lng}&format=geojson&accept-language=${lang}`;

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
            const address = response.features[0].properties.address;
            return {
                address: address.road,
                postalNumber: address.postcode
            };
        }
        return {
            address: '',
            postalNumber: ''
        };
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

export { IAddressData, IAddressFeature };
