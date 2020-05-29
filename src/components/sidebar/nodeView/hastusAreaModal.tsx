import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Button } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import SaveButton from '~/components/shared/SaveButton';
import { IStop } from '~/models';
import IHastusArea from '~/models/IHastusArea';
import hastusAreaValidationModel from '~/models/validationModels/hastusAreaValidationModel';
import StopService from '~/services/stopService';
import { ModalStore } from '~/stores/modalStore';
import { NodeStore } from '~/stores/nodeStore';
import FormValidator, { IValidationResult } from '~/validation/FormValidator';
import Loader from '../../shared/loader/Loader';
import * as s from './hastusAreaModal.scss';

interface IHastusAreaModalProps {
    isNewHastusArea: boolean;
    existingHastusAreas: IHastusArea[];
    saveHastusArea: ({ isNewHastusArea }: { isNewHastusArea: boolean }) => void;
    nodeStore?: NodeStore;
    modalStore?: ModalStore;
}

interface IHastusAreaModalState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    otherStopsUsingHastus: IStop[];
}

@inject('nodeStore', 'modalStore')
@observer
class HastusAreaModal extends Component<IHastusAreaModalProps, IHastusAreaModalState> {
    private _isMounted: boolean;
    constructor(props: IHastusAreaModalProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {},
            otherStopsUsingHastus: [],
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
                (stop) => stop.hastusId === currentHastusArea.id
            );
            this._setState({
                otherStopsUsingHastus,
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
                errorMessage: `Hastus-paikka ${hastusArea.id} on jo olemassa.`,
            };
            invalidPropertiesMap['id'] = validationResult;
        }

        this._setState({
            invalidPropertiesMap,
        });
    };

    private isHastusAreaIdAlreadyFound = (id: string) => {
        return this.props.existingHastusAreas.find((ha) => ha.id === id);
    };

    private saveHastusArea = () => {
        this.props.saveHastusArea({ isNewHastusArea: this.props.isNewHastusArea });
        this.props.modalStore!.closeModal();
    };

    private closeModal = () => {
        this.props.modalStore!.closeModal();
    };

    render() {
        const nodeStore = this.props.nodeStore!;
        const hastusArea = nodeStore.hastusArea;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        const hastusEditNotification =
            this.state.otherStopsUsingHastus.length > 0
                ? `Huom. tunnuksen muokkaaminen muuttaa kaikkien saman hastuksen omaavien pysäkkien ( ${this.state.otherStopsUsingHastus
                      .map((stop) => stop.nodeId)
                      .join(', ')
                      .toString()} ) tunnuksen.`
                : undefined;
        const isFormValid = !Object.values(invalidPropertiesMap).some(
            (validatorResult) => !validatorResult.isValid
        );
        const isDirty = !_.isEqual(
            this.props.nodeStore!.hastusArea,
            this.props.nodeStore!.oldHastusArea
        );
        const isSaveButtonDisabled = !isDirty || !isFormValid;
        return (
            <div className={s.hastusAreaModal}>
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
                        hastusEditNotification && (
                            <div className={s.flexRow}>{hastusEditNotification}</div>
                        )
                    )}
                </div>
                <div className={s.bottomBarButtons}>
                    <Button isWide={true} onClick={this.closeModal}>
                        Peruuta
                    </Button>
                    <SaveButton
                        onClick={this.saveHastusArea}
                        disabled={isSaveButtonDisabled}
                        savePreventedNotification={''}
                        isWide={true}
                        hasPadding={false}
                        data-cy='hastusSaveButton'
                    >
                        Tallenna
                    </SaveButton>
                </div>
            </div>
        );
    }
}

export default HastusAreaModal;
