import { observable, reaction, IReactionDisposer } from 'mobx';
import FormValidator, { IValidationResult } from '~/validation/FormValidator';

interface ICustomValidatorObject {
    validator: Function;
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
    @observable private _validationObject: ValidationObject | null;
    @observable private _invalidPropertiesMap: object;
    @observable private _validationModel: ValidationModel;
    private _customValidatorMap: ICustomValidatorMap | null;
    private _propertyListeners: IReactionDisposer[];

    constructor(validationModel: ValidationModel) {
        this._propertyListeners = [];
        this._validationModel = validationModel;
    }

    public init = (validationObject: ValidationObject, customValidatorsMap?: ICustomValidatorMap) => {
        this.clear();
        this._validationObject = validationObject;
        this._customValidatorMap = customValidatorsMap ? customValidatorsMap : null;

        this.createPropertyListeners();
        this.validateAllProperties();
    };

    public updateProperty = (property: string, value: any) => {
        this._validationObject![property] = value;
    };

    /**
     * @param {boolean} isDependentPropertiesValidationPrevented - if true, prevents validating dependent properties of a dependent property (to prevent infinite validation loop)
    */
    public validateProperty = (property: string, isDependentPropertiesValidationPrevented?: boolean) => {
        const validatorRule = this._validationModel[property];
        if (!validatorRule) return;
        const value = this._validationObject![property];
        const customValidatorObject = this._customValidatorMap?.[property];
        let validatorResult: IValidationResult | undefined;
        if (this._customValidatorMap) {
            validatorResult = customValidatorObject?.validator(this._validationObject, property, value);
        }
        if (!validatorResult || (validatorResult && validatorResult.isValid)) {
            validatorResult = FormValidator.validateProperty(validatorRule, value);
        }
        if (validatorResult) {
            this._invalidPropertiesMap[property] = validatorResult;
        }

        if (!isDependentPropertiesValidationPrevented && customValidatorObject && customValidatorObject.dependentProperties) {
            customValidatorObject.dependentProperties.forEach(prop => this.validateProperty(prop, true));
        }
    };

    public validateAllProperties = () => {
        if (!this._validationObject) {
            throw 'ValidationStore error: tried to validate an empty validationObject';
        }

        const invalidPropertiesMap: object = {};

        Object.entries(this._validationModel).forEach(([property, validatorRule]) => {
            const validationResult = FormValidator.validateProperty(
                validatorRule,
                this._validationObject![property]
            );
            if (validationResult) {
                invalidPropertiesMap[property] = validationResult;
            }
        });
        this._invalidPropertiesMap = invalidPropertiesMap;
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
        this._invalidPropertiesMap = {};
        this.removePropertyListeners();
    };

    private createPropertyListeners = () => {
        for (const property in this._validationModel!) {
            if (Object.prototype.hasOwnProperty.call(this._validationModel, property)) {
                const listener = this.initPropertyListener(property);
                this._propertyListeners.push(listener);
            }
        }
    };

    private initPropertyListener = (property: string): IReactionDisposer => {
        return reaction(
            () => this._validationObject && this._validationObject[property],
            () =>
                this.validateProperty(property)
        );
    };

    private removePropertyListeners = () => {
        if (this._propertyListeners.length === 0) return;
        this._propertyListeners.forEach((listener: IReactionDisposer) => listener());
        this._propertyListeners = [];
    };
}

export default ValidationStore;

export { ICustomValidatorMap }