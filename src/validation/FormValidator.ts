import Validator from 'validatorjs';
import ruleTranslations from './validationRuleTranslations';

export interface IValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

export default class FormValidator {
    private static validate<type>(type: string, value: type, rule: string) {
        const validator = new Validator(
            {
                [type]: value,
            },
            {
                [type]: rule,
            },
            ruleTranslations,
            );

        const isValid = !!validator.passes();
        const firstErrorMessage = validator.errors.first(type);

        return {
            isValid,
            errorMessage: typeof firstErrorMessage === 'string' ? firstErrorMessage : '',
        };
    }

    public static validateString(value: string, rule: string) : IValidationResult {
        return FormValidator.validate<string>('string', value, rule);
    }

    public static validateNumber(value: number, rule: string) : IValidationResult {
        return FormValidator.validate<number>('numeric', value, rule);
    }
}
