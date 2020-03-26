import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import InputContainer from '~/components/controls/InputContainer';
import { IStop } from '~/models';
import IHastusArea from '~/models/IHastusArea';
import hastusAreaValidationModel from '~/models/validationModels/hastusAreaValidationModel';
import StopService from '~/services/stopService';
import { ConfirmStore } from '~/stores/confirmStore';
import { NodeStore } from '~/stores/nodeStore';
import FormValidator, { IValidationResult } from '~/validation/FormValidator';
import Loader from '../../shared/loader/Loader';
import * as s from './hastusAreaForm.scss';

interface IHastusAreaFromProps {
    isNewHastusArea: boolean;
    existingHastusAreas: IHastusArea[];
    nodeStore?: NodeStore;
    confirmStore?: ConfirmStore;
}

interface IHastusAreaFromState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    otherStopsUsingHastus: IStop[];
}

@inject('nodeStore', 'confirmStore')
@observer
class HastusAreaFrom extends Component<IHastusAreaFromProps, IHastusAreaFromState> {
    private _isMounted: boolean;
    constructor(props: IHastusAreaFromProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {},
            otherStopsUsingHastus: []
        };
    }
    private _setState = (newState: object) => {
        if (this._isMounted) {
            this.setState(newState);
        }
    };

    async componentDidMount() {
        this._isMounted = true;
        this._setState({ isLoading: true });
        this.validateHastusArea();
        if (!this.props.isNewHastusArea) {
            const currentHastusArea = this.props.nodeStore!.hastusArea;
            const stops = await StopService.fetchAllStops();
            const otherStopsUsingHastus = stops.filter(
                stop => stop.hastusId === currentHastusArea.id
            );
            this._setState({
                otherStopsUsingHastus
            });
        }
        this._setState({ isLoading: false });
    }

    componentWillUnmount() {
        this._isMounted = false;
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

        if (this.isHastusAreaIdAlreadyFound(hastusArea.id)) {
            const validationResult: IValidationResult = {
                isValid: false,
                errorMessage: `Hastus-paikka ${hastusArea.id} on jo olemassa.`
            };
            invalidPropertiesMap['id'] = validationResult;
        }
        this.updateConfirmButtonState(invalidPropertiesMap);

        this._setState({
            invalidPropertiesMap
        });
    };

    private updateConfirmButtonState = (invalidPropertiesMap: object) => {
        const isFormValid = !Object.values(invalidPropertiesMap).some(
            validatorResult => !validatorResult.isValid
        );
        const isDirty = !_.isEqual(
            this.props.nodeStore!.hastusArea,
            this.props.nodeStore!.oldHastusArea
        );
        const isSaveButtonDisabled = !isDirty || !isFormValid;
        this.props.confirmStore!.setIsConfirmButtonDisabled(isSaveButtonDisabled);
    };

    private isHastusAreaIdAlreadyFound = (id: string) => {
        return this.props.existingHastusAreas.find(ha => ha.id === id);
    };

    render() {
        const nodeStore = this.props.nodeStore!;
        const hastusArea = nodeStore.hastusArea;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        const confirmNotification =
            this.state.otherStopsUsingHastus.length > 0
                ? `Huom. tunnuksen muokkaaminen muuttaa kaikkien saman hastuksen omaavien pysäkkien ( ${this.state.otherStopsUsingHastus
                      .map(stop => stop.nodeId)
                      .join(', ')
                      .toString()} ) tunnuksen.`
                : undefined;
        return (
            <div className={classnames(s.hastusAreaForm, s.form)} data-cy='hastusAreaForm'>
                <div className={s.header}>
                    {this.props.isNewHastusArea
                        ? 'Luo uusi Hastus-paikka'
                        : 'Muokkaa Hastus-paikkaa'}
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='TUNNUS'
                        value={hastusArea.id}
                        onChange={this.updateHastusAreaProperty('id')}
                        validationResult={invalidPropertiesMap['id']}
                        data-cy='hastusIdInput'
                    />
                    <InputContainer
                        label='NIMI'
                        value={hastusArea.name}
                        onChange={this.updateHastusAreaProperty!('name')}
                        validationResult={invalidPropertiesMap['name']}
                        data-cy='hastusNameInput'
                    />
                </div>
                {this.state.isLoading ? (
                    <Loader size={'tiny'} />
                ) : (
                    confirmNotification && <div className={s.flexRow}>{confirmNotification}</div>
                )}
            </div>
        );
    }
}

export default HastusAreaFrom;
