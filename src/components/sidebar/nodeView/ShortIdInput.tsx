import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import Dropdown, { IDropdownItem } from '~/components/controls/Dropdown';
import { INode } from '~/models';
import StopService from '~/services/stopService';
import { NodeStore } from '~/stores/nodeStore';
import * as s from './shortIdInput.scss';

interface IStopFormProps {
    node: INode;
    isBackgroundGrey: boolean;
    isEditingDisabled: boolean;
    nodeInvalidPropertiesMap: object;
    nodeStore?: NodeStore;
    onNodePropertyChange: (property: keyof INode) => (value: any) => void;
}

interface IStopFormState {
    availableShortIdDropdownItems: IDropdownItem[];
}

@inject('nodeStore')
@observer
class ShortIdInput extends React.Component<IStopFormProps, IStopFormState> {
    private mounted: boolean;
    private isShortIdLetterListener: IReactionDisposer;

    constructor(props: IStopFormProps) {
        super(props);
        this.state = {
            availableShortIdDropdownItems: []
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.isShortIdLetterListener = reaction(
            () => this.props.nodeStore!.node && this.props.nodeStore!.node.shortIdLetter,
            this.updateAvailableShortIds
        );
        this.updateAvailableShortIds();
    }

    componentWillUnmount() {
        this.mounted = false;
        this.isShortIdLetterListener();
    }

    private updateAvailableShortIds = async () => {
        const node = this.props.nodeStore!.node;
        if (!node) return;

        const shortIdLetter = node.shortIdLetter;
        const availableShortIds: string[] = await StopService.fetchAvailableShortIds(
            node.id,
            shortIdLetter
        );
        if (this.mounted) {
            this.setState({
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
        this.props.onNodePropertyChange('shortIdString')(value);
    };

    private renderValidationNotification = () => {
        const validationResult = this.props.nodeInvalidPropertiesMap['shortIdString'];
        if (this.props.isEditingDisabled || (validationResult && validationResult.errorMessage)) {
            return null;
        }
        const selectedShortId = this.props.node.shortIdString;
        if (!selectedShortId) return null;

        const isAvailable = this.state.availableShortIdDropdownItems.find(
            (item: IDropdownItem) => item.value === selectedShortId
        );
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
                    <Dropdown
                        label={shortIdLabel}
                        onChange={this.onNodeShortIdChange}
                        items={this.state.availableShortIdDropdownItems}
                        selected={node.shortIdString}
                        disabled={isEditingDisabled}
                        isBackgroundGrey={this.props.isBackgroundGrey}
                        validationResult={this.props.nodeInvalidPropertiesMap['shortIdString']}
                        isAnyInputValueAllowed={true}
                        isNoOptionsMessageHidden={true}
                        isSelectedOptionHidden={true}
                    />
                </div>
                <div>{this.renderValidationNotification()}</div>
            </div>
        );
    }
}

export default ShortIdInput;
