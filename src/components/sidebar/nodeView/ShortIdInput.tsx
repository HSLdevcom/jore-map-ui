import classnames from 'classnames';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import Dropdown, { IDropdownItem } from '~/components/controls/Dropdown';
import InputContainer from '~/components/controls/InputContainer';
import ButtonType from '~/enums/buttonType';
import { INode } from '~/models';
import StopService from '~/services/stopService';
import { NodeStore } from '~/stores/nodeStore';
import * as s from './shortIdInput.scss';

interface IStopFormProps {
    node: INode;
    isEditingDisabled: boolean;
    nodeInvalidPropertiesMap: object;
    nodeStore?: NodeStore;
    onNodePropertyChange: (property: keyof INode) => (value: any) => void;
}

interface IStopFormState {
    availableShortIds: string[];
    availableShortIdDropdownItems: IDropdownItem[];
    isAvailableShortIdsDropdownVisible: boolean;
}

@inject('nodeStore')
@observer
class ShortIdInput extends React.Component<IStopFormProps, IStopFormState> {
    private mounted: boolean;
    private isShortIdLetterListener: IReactionDisposer;

    constructor(props: IStopFormProps) {
        super(props);
        this.state = {
            availableShortIds: [],
            availableShortIdDropdownItems: [],
            isAvailableShortIdsDropdownVisible: false
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.isShortIdLetterListener = reaction(
            () => this.props.nodeStore!.node.shortIdLetter,
            this.fetchAvailableShortIds
        );
        this.fetchAvailableShortIds();
    }

    componentWillUnmount() {
        this.mounted = false;
        this.isShortIdLetterListener();
    }

    private fetchAvailableShortIds = async () => {
        const shortIdLetter = this.props.nodeStore!.node.shortIdLetter;
        const availableShortIds: string[] = await StopService.fetchAvailableShortIds(shortIdLetter);
        if (this.mounted) {
            this.setState({
                availableShortIds,
                availableShortIdDropdownItems: this.createAvailableShortIdDropdownItems(
                    availableShortIds
                )
            });
        }
    };

    private createAvailableShortIdDropdownItems = (
        availableShortIds: string[]
    ): IDropdownItem[] => {
        return availableShortIds.map((shortId: string) => {
            const item: IDropdownItem = {
                value: `${shortId}`,
                label: `${shortId}`
            };
            return item;
        });
    };

    private onNodeShortIdChange = (value: string) => {
        this.setState({
            isAvailableShortIdsDropdownVisible: false
        });
        this.props.onNodePropertyChange('shortIdString')(value);
    };

    private renderToggleDropdownButton = () => {
        const text = this.state.isAvailableShortIdsDropdownVisible ? 'X' : 'Hae';
        return (
            <Button
                onClick={() => this.toggleDropdownVisibility()}
                type={ButtonType.SQUARE}
                className={classnames(
                    s.shortIdInputButton,
                    this.state.isAvailableShortIdsDropdownVisible ? s.redBackground : null
                )}
            >
                {text}
            </Button>
        );
    };

    private toggleDropdownVisibility = () => {
        this.setState({
            isAvailableShortIdsDropdownVisible: !this.state.isAvailableShortIdsDropdownVisible
        });
    };

    private renderValidationNotification = () => {
        const validationResult = this.props.nodeInvalidPropertiesMap['shortIdString'];
        if (this.props.isEditingDisabled || validationResult.errorMessage) return null;
        const selectedShortId = this.props.node.shortIdString;
        if (!selectedShortId) return null;
        if (!this.props.nodeStore!.isShortIdDirty) return null;

        const isAvailable = this.state.availableShortIds.includes(selectedShortId);
        return isAvailable ? (
            <div className={s.isValidMessage}>Lyhyttunnus on vapaa</div>
        ) : (
            <div className={s.warningMessage}>Lyhyttunnus on jo käytössä</div>
        );
    };

    render() {
        const isEditingDisabled = this.props.nodeStore!.isEditingDisabled;
        const node = this.props.node;
        const shortIdLabel = '+ 4 num.)';
        return (
            <div className={s.shortIdInputView}>
                <div className={s.shortIdInputContainer}>
                    {this.state.isAvailableShortIdsDropdownVisible ? (
                        <Dropdown
                            label={shortIdLabel}
                            onChange={this.onNodeShortIdChange}
                            items={this.state.availableShortIdDropdownItems}
                            selected={node.shortIdString}
                            emptyItem={{
                                value: '',
                                label: ''
                            }}
                            disabled={isEditingDisabled}
                            validationResult={this.props.nodeInvalidPropertiesMap['shortIdString']}
                            isDropdownOpen={true}
                        />
                    ) : (
                        <InputContainer
                            label={shortIdLabel}
                            onChange={this.onNodeShortIdChange}
                            disabled={isEditingDisabled}
                            value={node.shortIdString}
                            validationResult={this.props.nodeInvalidPropertiesMap['shortIdString']}
                        />
                    )}
                    {!isEditingDisabled && this.renderToggleDropdownButton()}
                </div>
                <div>{this.renderValidationNotification()}</div>
            </div>
        );
    }
}

export default ShortIdInput;
