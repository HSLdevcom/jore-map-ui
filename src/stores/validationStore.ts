import { observable, reaction, IReactionDisposer } from 'mobx';
import FormValidator, { IValidationResult } from '~/validation/FormValidator';

class ValidationStore<ValidationObject, ValidationModel> {
    @observable private _validationObject: ValidationObject | null;
    @observable private _invalidPropertiesMap: object;
    @observable private _validationModel: ValidationModel;
    private propertyListeners: IReactionDisposer[];

    constructor(validationModel: ValidationModel) {
        this.clear();

        this._validationModel = validationModel;
        this.propertyListeners = [];
    }

    public init = (validationObject: ValidationObject) => {
        this._validationObject = validationObject;

        if (this.propertyListeners.length > 0) {
            this.removePropertyListeners();
        }
        this.createPropertyListeners();
        this.validateAllProperties();
    };

    public updateProperty = (property: string, value: any) => {
        this._validationObject![property] = value;
    };

    public validateProperty = (validatorRule: string, property: string, value: any) => {
        if (!validatorRule) return;
        const validatorResult: IValidationResult | undefined = FormValidator.validateProperty(
            validatorRule,
            value
        );
        if (validatorResult) {
            this.setValidatorResult(property, validatorResult);
        }
    };

    public setValidatorResult = (property: string, validatorResult: IValidationResult) => {
        this._invalidPropertiesMap[property] = validatorResult;
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

    public clearInvalidPropertiesMap = () => {
        this._invalidPropertiesMap = {};
    };

    public clear = () => {
        this._validationObject = null;
        this._invalidPropertiesMap = {};
    };

    private createPropertyListeners = () => {
        for (const property in this._validationObject!) {
            if (Object.prototype.hasOwnProperty.call(this._validationObject, property)) {
                const listener = this.initPropertyListener(property);
                this.propertyListeners.push(listener);
            }
        }
    };

    private initPropertyListener = (property: string): IReactionDisposer => {
        return reaction(
            () => this._validationObject && this._validationObject[property],
            () =>
                this.validateProperty(
                    this._validationModel[property],
                    property,
                    this._validationObject![property]
                )
        );
    };

    private removePropertyListeners = () => {
        this.propertyListeners.forEach((listener: IReactionDisposer) => listener());
        this.propertyListeners = [];
    };
}

export default ValidationStore;
