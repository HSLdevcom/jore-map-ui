import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IDropdownItem } from '~/components/controls/Dropdown';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import { INode, IStop } from '~/models';
import stopValidationModel from '~/models/validationModels/stopValidationModel';
import StopAreaService, { IStopAreaItem } from '~/services/stopAreaService';
import StopService, { IStopSectionItem } from '~/services/stopService';
import { CodeListStore } from '~/stores/codeListStore';
import { NodeStore } from '~/stores/nodeStore';
import StopForm from './StopForm';

interface IStopViewProps {
    node: INode;
    isNewStop: boolean;
    isEditingDisabled: boolean;
    nodeStore?: NodeStore;
    codeListStore?: CodeListStore;
    nodeInvalidPropertiesMap: object;
    onNodePropertyChange?: (property: keyof INode) => (value: any) => void;
}

interface IStopViewState {
    isLoading: boolean; // not currently in use, declared because ViewFormBase needs this
    invalidPropertiesMap: object;
    isEditingDisabled: boolean;
    stopAreas: IStopAreaItem[];
    stopSections: IDropdownItem[];
}

@inject('nodeStore', 'codeListStore')
@observer
class StopView extends ViewFormBase<IStopViewProps, IStopViewState> {
    private isEditingDisabledListener: IReactionDisposer;
    private nodeListener: IReactionDisposer;
    private stopPropertyListeners: IReactionDisposer[];
    private mounted: boolean;

    constructor(props: IStopViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {},
            isEditingDisabled: false,
            stopAreas: [],
            stopSections: []
        };
        this.stopPropertyListeners = [];
    }

    async componentDidMount() {
        this.mounted = true;
        this.validateStop();
        this.isEditingDisabledListener = reaction(
            () => this.props.nodeStore!.isEditingDisabled,
            this.onChangeIsEditingDisabled
        );
        this.nodeListener = reaction(() => this.props.nodeStore!.node, this.onNodeChange);
        this.createStopPropertyListeners();
        if (this.props.isNewStop) {
            this.props.nodeStore!.fetchAddressData();
        }
        const stopAreas: IStopAreaItem[] = await StopAreaService.fetchAllStopAreas();
        const stopSections: IStopSectionItem[] = await StopService.fetchAllStopSections();

        if (this.mounted) {
            this.setState({
                stopAreas,
                stopSections: this.createStopSectionDropdownItems(stopSections)
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.isEditingDisabledListener();
        this.removeStopPropertyListeners();
        this.nodeListener();
    }

    private createStopPropertyListeners = () => {
        const nodeStore = this.props.nodeStore;
        if (!nodeStore!.node) return;

        const stop = nodeStore!.node.stop;
        for (const property in stop!) {
            if (Object.prototype.hasOwnProperty.call(stop, property)) {
                const listener = this.createListener(property);
                this.stopPropertyListeners.push(listener);
            }
        }
    };

    private createListener = (property: string) => {
        return reaction(
            () => this.props.nodeStore!.node && this.props.nodeStore!.node!.stop![property],
            this.validateStopProperty(property)
        );
    };

    private removeStopPropertyListeners = () => {
        this.stopPropertyListeners.forEach((listener: IReactionDisposer) => listener());
        this.stopPropertyListeners = [];
    };

    private onChangeIsEditingDisabled = () => {
        this.clearInvalidPropertiesMap();
        if (!this.props.nodeStore!.isEditingDisabled) this.validateStop();
    };

    private onNodeChange = async () => {
        this.validateStop();
        this.removeStopPropertyListeners();
        this.createStopPropertyListeners();
        if (
            !this.props.nodeStore!.node ||
            (!this.props.isNewStop && this.props.nodeStore!.isEditingDisabled)
        ) {
            return;
        }
        await this.props.nodeStore!.fetchAddressData();
    };

    private validateStopProperty = (property: string) => () => {
        const nodeStore = this.props.nodeStore;
        if (!nodeStore!.node) return;
        const value = nodeStore!.node!.stop![property];
        this.validateProperty(stopValidationModel[property], property, value);
        const isStopFormValid = this.isFormValid();
        nodeStore!.setIsStopFormValid(isStopFormValid);
    };

    private createStopSectionDropdownItems = (
        stopSections: IStopSectionItem[]
    ): IDropdownItem[] => {
        return stopSections.map((stopSection: IStopSectionItem) => {
            const item: IDropdownItem = {
                value: `${stopSection.selite}`,
                label: `${stopSection.selite}`
            };
            return item;
        });
    };

    private validateStop = () => {
        const node = this.props.nodeStore!.node;
        if (!node) return;
        const stop = node.stop;
        this.validateAllProperties(stopValidationModel, stop);
        const isStopFormValid = this.isFormValid();
        this.props.nodeStore!.setIsStopFormValid(isStopFormValid);
    };

    private updateStopProperty = (property: keyof IStop) => (value: any) => {
        this.props.nodeStore!.updateStop(property, value);
    };

    render() {
        const isEditingDisabled = this.props.nodeStore!.isEditingDisabled;
        const { node, isNewStop, onNodePropertyChange } = this.props;
        return (
            <StopForm
                node={node}
                isNewStop={isNewStop}
                isEditingDisabled={isEditingDisabled}
                stopAreas={this.state.stopAreas}
                stopSections={this.state.stopSections}
                stopInvalidPropertiesMap={this.state.invalidPropertiesMap}
                nodeInvalidPropertiesMap={this.props.nodeInvalidPropertiesMap}
                updateStopProperty={this.updateStopProperty}
                onNodePropertyChange={onNodePropertyChange}
            />
        );
    }
}

export default StopView;
