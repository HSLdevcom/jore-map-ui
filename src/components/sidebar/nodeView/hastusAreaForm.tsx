import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import InputContainer from '~/components/controls/InputContainer';
import IHastusArea from '~/models/IHastusArea';
import hastusAreaValidationModel from '~/models/validationModels/hastusAreaValidationModel';
import { ConfirmStore } from '~/stores/confirmStore';
import { NodeStore } from '~/stores/nodeStore';
import FormValidator from '~/validation/FormValidator';
import * as s from './hastusAreaForm.scss';

interface IHastusAreaFromProps {
    nodeStore?: NodeStore;
    confirmStore?: ConfirmStore;
}

interface IHastusAreaFromState {
    invalidPropertiesMap: object;
}

@inject('nodeStore', 'confirmStore')
@observer
class HastusAreaFrom extends Component<IHastusAreaFromProps, IHastusAreaFromState> {
    constructor(props: IHastusAreaFromProps) {
        super(props);
        this.state = {
            invalidPropertiesMap: {}
        };
    }
    componentDidMount() {
        this.validateHastusArea();
    }

    private updateHastusAreaProperty = (property: keyof IHastusArea) => (value: any) => {
        this.props.nodeStore!.updateHastusAreaProperty(property, value);
        this.validateHastusArea();
    };

    private validateHastusArea = () => {
        const hastusArea = this.props.nodeStore!.hastusArea;
        const invalidPropertiesMap = FormValidator.validateAllProperties(
            hastusAreaValidationModel,
            hastusArea
        );

        const isFormValid = !Object.values(invalidPropertiesMap).some(
            validatorResult => !validatorResult.isValid
        );
        this.props.confirmStore!.setIsConfirmButtonDisabled(!isFormValid);

        this.setState({
            invalidPropertiesMap
        });
    };

    render() {
        const nodeStore = this.props.nodeStore!;
        const hastusArea = nodeStore.hastusArea;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        return (
            <div className={classnames(s.hastusAreaForm, s.form)}>
                <div className={s.header}>Luo uusi Hastus-paikka</div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='TUNNUS'
                        value={hastusArea.id}
                        onChange={this.updateHastusAreaProperty('id')}
                        validationResult={invalidPropertiesMap['id']}
                    />
                    <InputContainer
                        label='NIMI'
                        value={hastusArea.name}
                        onChange={this.updateHastusAreaProperty!('name')}
                        validationResult={invalidPropertiesMap['name']}
                    />
                </div>
            </div>
        );
    }
}

export default HastusAreaFrom;
