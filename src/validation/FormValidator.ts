import { LatLng } from 'leaflet';
import Validator from 'validatorjs';
import ruleTranslations from './validationRuleTranslations';

export interface IValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

const LATITUDE_MIN = 59;
const LATITUDE_MAX = 62;
const LONGITUDE_MIN = 23;
const LONGITUDE_MAX = 27;

const validateLatLngs = (latLng: LatLng) => {
    return (
        latLng.lat >= LATITUDE_MIN &&
        latLng.lat <= LATITUDE_MAX &&
        latLng.lng >= LONGITUDE_MIN &&
        latLng.lng <= LONGITUDE_MAX
    );
};

Validator.register(
    'latLngValidator',
    validateLatLngs,
    'Koordinaatti sallittujen rajojen ulkopuolella.'
);

class FormValidator {
    public static validate = (value: any, rule: string): IValidationResult => {
        const validator = new Validator(
            {
                value
            },
            {
                value: rule
            },
            ruleTranslations
        );

        const isValid = Boolean(validator.passes());
        const firstErrorMessage = validator.errors.first('value');

        return {
            isValid,
            errorMessage: typeof firstErrorMessage === 'string' ? firstErrorMessage : ''
        };
    };
}

export default FormValidator;
