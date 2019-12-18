import _ from 'lodash';
import { observable } from 'mobx';
import FormValidator, { IValidationResult } from '~/validation/FormValidator';

interface ICustomValidatorObject {
    validator: Function;
    // TODO: use typings so that each element in string should be key in ValidationModel
    dependentProperties?: string[]; // List of properties that also need to be validated when the main property is validated
}

interface ICustomValidatorMap {
    [key: string]: ICustomValidatorObject;
}

/**
 * Generic validation store to be used by other stores.
 * Call init() when validationObject changes
 * Call updateProperty() always when validationObject's value is changed
 * Call validateAllProperties() when isEditingDisabled of a View is changed
 * Call clear() to release memory when a store using validation store is cleared
 * @param {Object} ValidationObject - object to validate (e.g. ILink)
 * @param {Object} ValidationModel - { property: string}, where property = validation string (e.g. IValidationModel)
 */
class ValidationStore<ValidationObject, ValidationModel> {
    @observable private _invalidPropertiesMap: object;
    private _validationObject: ValidationObject | null;
    private _validationModel: ValidationModel | null;
    private _customValidatorMap: ICustomValidatorMap | null;

    public init = (validationObject: ValidationObject, validationModel: ValidationModel, customValidatorsMap?: ICustomValidatorMap) => {
        this.clear();
        this._validationObject = validationObject;
        this._validationModel = validationModel;
        this._customValidatorMap = customValidatorsMap ? customValidatorsMap : null;

        this.validateAllProperties();
    };

    public updateProperty = (property: string, value: any) => {
        this._validationObject![property] = value;
        this.validateProperty(property);
    };

    /**
     * @param {boolean} isDependentPropertiesValidationPrevented - if true, prevents validating dependent properties of a dependent property (to prevent infinite validation loop)
    */
    public validateProperty = (property: string, isDependentPropertiesValidationPrevented?: boolean) => {
        const validatorRule = this._validationModel![property];
        const value = this._validationObject![property];
        const customValidatorObject = this._customValidatorMap?.[property];
        let validatorResult: IValidationResult | undefined;
        if (this._customValidatorMap) {
            validatorResult = customValidatorObject?.validator(this._validationObject!, property, value);
        }
        if (!validatorResult || (validatorResult && validatorResult.isValid)) {
            if (!_.isEmpty(validatorRule)) {
                validatorResult = FormValidator.validateProperty(validatorRule, value);
            }
        }
        if (validatorResult) {
            this._invalidPropertiesMap[property] = validatorResult;
        }
        if (!validatorResult?.isValid) return;

        if (!isDependentPropertiesValidationPrevented && customValidatorObject && customValidatorObject.dependentProperties) {
            customValidatorObject.dependentProperties.forEach(prop => this.validateProperty(prop, true));
        }
    };

    public validateAllProperties = () => {
        if (!this._validationModel) return;
        Object.entries(this._validationModel).forEach(([property, validatorRule]) => {
            this.validateProperty(property);
        });
    };

    public isValid = () => {
        return !Object.values(this._invalidPropertiesMap).some(
            validatorResult => !validatorResult.isValid
        );
    };

    public getInvalidPropertiesMap = () => {
        return this._invalidPropertiesMap;
    };

    public clear = () => {
        this._validationObject = null;
        this._validationModel = null;
        this._invalidPropertiesMap = {};
    };
}

export default ValidationStore;

export { ICustomValidatorMap }