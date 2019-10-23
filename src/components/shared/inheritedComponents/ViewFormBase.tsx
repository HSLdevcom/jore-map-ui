import { Component } from 'react';
import FormValidator, { IValidationResult } from '~/validation/FormValidator';

interface IViewFormBaseState {
    isLoading: boolean;
    invalidPropertiesMap: object;
}

// TODO: refactor to use composition / refactor to its own store?
// Inheritance is considered as a bad practice, react doesn't really support inheritance:
// https://stackoverflow.com/questions/31072841/componentdidmount-method-not-triggered-when-using-inherited-es6-react-class
class ViewFormBase<Props, State extends IViewFormBaseState> extends Component<Props, State> {
    private _validateUsingModel = (validationModel: object, validationEntity: any) => {
        Object.entries(validationModel).forEach(([property, validatorRule]) => {
            this.validateProperty(validatorRule, property, validationEntity[property]);
        });
    };

    protected isFormValid = () => {
        return !Object.values(this.state.invalidPropertiesMap).some(
            validatorResult => !validatorResult.isValid
        );
    };

    protected validateAllProperties = (validationModel: object, validationEntity: any) => {
        if (!validationEntity) return;

        this._validateUsingModel(validationModel, validationEntity);
    };

    protected validateProperty = (validatorRule: string, property: string, value: any) => {
        if (!validatorRule) return;

        const validatorResult: IValidationResult = FormValidator.validate(value, validatorRule);
        this.setValidatorResult(property, validatorResult);
    };

    protected setValidatorResult = (property: string, validatorResult: IValidationResult) => {
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        invalidPropertiesMap[property] = validatorResult;
        this.setState({
            invalidPropertiesMap
        });
    };

    protected clearInvalidPropertiesMap = () => {
        this.setState({
            invalidPropertiesMap: {}
        });
    };
}

export default ViewFormBase;
