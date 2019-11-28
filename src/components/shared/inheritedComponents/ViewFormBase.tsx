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
    protected isFormValid = () => {
        return FormValidator.isInvalidPropertiesMapValid(this.state.invalidPropertiesMap);
    };

    protected validateAllProperties = (validationModel: object, validationEntity: any) => {
        if (!validationEntity) return;

        const invalidPropertiesMap = FormValidator.validateAllProperties(
            validationModel,
            validationEntity
        );
        this.setState({
            invalidPropertiesMap
        });
    };

    protected validateProperty = (validatorRule: string, property: string, value: any) => {
        if (!validatorRule) return;

        const validatorResult: IValidationResult | undefined = FormValidator.validateProperty(
            validatorRule,
            value
        );
        if (validatorResult) {
            this.setValidatorResult(property, validatorResult);
        }
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
