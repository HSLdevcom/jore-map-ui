import Validator from 'validatorjs';
import ruleTranslations from './validationRuleTranslations';

export interface IValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

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
