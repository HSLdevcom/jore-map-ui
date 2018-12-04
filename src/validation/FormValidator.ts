import Validator from 'validatorjs';
import ruleTranslations from './validationRuleTranslations';

export interface IValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

export default class FormValidator {
    public static validateString(value: string, rule: string) : IValidationResult {
        const validator = new Validator(
            {
                value,
            },
            {
                value: rule,
            },
            ruleTranslations,
            );

        const isValid = !!validator.passes();
        const firstErrorMessage = validator.errors.first('value');

        return {
            isValid,
            errorMessage: typeof firstErrorMessage === 'string' ? firstErrorMessage : '',
        };
    }
}
