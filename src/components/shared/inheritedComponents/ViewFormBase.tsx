import { Component } from 'react';
import FormValidator, { IValidationResult } from '~/validation/FormValidator';
import EventManager from '~/util/EventManager';

interface IViewFormBaseState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    isEditingDisabled: boolean;
}

// TODO: refactor to use composition?
// Inheritance is considered as a bad practice, react doesn't really support inheritance:
// tslint:disable-next-line max-line-length
// https://stackoverflow.com/questions/31072841/componentdidmount-method-not-triggered-when-using-inherited-es6-react-class
class ViewFormBase<Props, State extends IViewFormBaseState> extends Component<Props, State> {
    componentDidMount() {
        EventManager.on('geometryChange', this.enableEditing);
    }

    componentWillUnmount() {
        EventManager.off('geometryChange', this.enableEditing);
    }

    private _validateUsingModel = (validationModel: object, validationEntity: any) => {
        Object.entries(validationModel).forEach(([property, validatorRule]) => {
            this.validateProperty(
                validatorRule,
                property,
                validationEntity[property],
            );
        });
    }

    protected isFormValid = () => {
        return !Object.values(this.state.invalidPropertiesMap)
            .some(validatorResult => !validatorResult.isValid);
    }

    protected validateAllProperties = (
        validationModel: object, validationEntity: any,
    ) => {
        this._validateUsingModel(validationModel, validationEntity);
    }

    protected validateProperty = (validatorRule: string, property: string, value: any) => {
        if (!validatorRule) return;

        const validatorResult: IValidationResult
            = FormValidator.validate(value, validatorRule);
        this.markInvalidProperties(property, validatorResult);
    }

    protected markInvalidProperties = (property: string, validatorResult: IValidationResult) => {
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        invalidPropertiesMap[property] = validatorResult;
        this.setState({
            invalidPropertiesMap,
        });
    }

    protected toggleIsEditingDisabled = () => {
        const isEditingDisabled = !this.state.isEditingDisabled;
        if (isEditingDisabled) {
            this.setState({
                isEditingDisabled,
                invalidPropertiesMap: {},
            });
        } else {
            this.setState({
                isEditingDisabled,
            });
        }
    }

    protected enableEditing = () => {
        this.setState({ isEditingDisabled: false });
    }
}

export default ViewFormBase;
