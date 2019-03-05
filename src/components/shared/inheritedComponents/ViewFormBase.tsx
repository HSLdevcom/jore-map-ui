import { Component } from 'react';

interface IViewFormBaseState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    isEditingDisabled: boolean;
}

class ViewFormBase<Props, State extends IViewFormBaseState> extends Component<Props, State> {
    protected isFormValid = () => {
        return !Object.values(this.state.invalidPropertiesMap)
            .some(fieldIsValid => !fieldIsValid);
    }

    protected markInvalidProperties = (property: string, isValid: boolean) => {
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        invalidPropertiesMap[property] = isValid;
        this.setState({
            invalidPropertiesMap,
        });
    }

    protected toggleIsEditingDisabled = (undoChange: () => void) => {
        if (!this.state.isEditingDisabled) {
            undoChange();
        }
        const isEditingDisabled = !this.state.isEditingDisabled;
        this.setState({
            isEditingDisabled,
            invalidPropertiesMap: {},
        });
    }
}

export default ViewFormBase;
