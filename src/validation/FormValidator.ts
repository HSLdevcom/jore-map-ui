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

const validateLatLngs = (latLng: any) => {
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
        if (rule.length === 0) {
            return {
                isValid: true,
            };
        }
        const validator = new Validator(
            {
                value,
            },
            {
                value: rule,
            },
            ruleTranslations
        );

        const isValid = Boolean(validator.passes());
        const firstErrorMessage = validator.errors.first('value');

        return {
            isValid,
            errorMessage: typeof firstErrorMessage === 'string' ? firstErrorMessage : '',
        };
    };

    public static validateAllProperties = (validationModel: object, validationEntity: any) => {
        const invalidPropertiesMap: object = {};

        Object.entries(validationModel).forEach(([property, validatorRule]) => {
            const validationResult = FormValidator.validateProperty(
                validatorRule,
                validationEntity[property]
            );
            if (validationResult) {
                invalidPropertiesMap[property] = validationResult;
            }
        });
        return invalidPropertiesMap;
    };

    public static validateProperty = (validatorRule: string, value: any): IValidationResult => {
        return FormValidator.validate(value, validatorRule);
    };

    public static isInvalidPropertiesMapValid = (invalidPropertiesMap: object) => {
        return !Object.values(invalidPropertiesMap).some(
            (validatorResult) => !validatorResult.isValid
        );
    };
}

export default FormValidator;
