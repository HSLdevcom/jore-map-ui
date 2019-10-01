import * as L from 'leaflet';
import ApiClient, { RequestMethod } from '~/util/ApiClient';
import constants from '~/constants/constants';

type langOptions = 'fi' | 'sv';

interface AddressData {
    address: string;
    postalNumber: string;
}

class GeocodingService {
    public static getAddressData = async (
        coordinates: L.LatLng,
        lang: langOptions
    ): Promise<AddressData> => {
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
}
export default GeocodingService;
