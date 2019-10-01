import * as L from 'leaflet';
import ApiClient, { RequestMethod } from '~/util/ApiClient';

const REVERSE_GEOCODING_URL = 'https://api.digitransit.fi/geocoding/v1/reverse';
type langOptions = 'fi' | 'sv';

interface AddressData {
    address: string;
    postalNumber: string;
}

class GeocodingService {
    public static getAddressData = async (
        coordinates: L.LatLng,
        lang: langOptions
    ): Promise<AddressData | null> => {
        // API docs
        // https://digitransit.fi/en/developers/apis/2-geocoding-api/address-lookup/
        // oa = use OpenAddress layer
        const requestUrl = `${REVERSE_GEOCODING_URL}?point.lat=${coordinates.lat}&point.lon=${coordinates.lng}&sources=oa&lang=${lang}`;

        const response = await ApiClient.sendRequest(
            RequestMethod.GET,
            encodeURI(requestUrl),
            {}
        );

        if (response && response.features && response.features[0]) {
            const properties = response.features[0].properties;
            return {
                address: properties.name,
                postalNumber: properties.postalcode
            };
        }
        return null;
    };
}
export default GeocodingService;
