import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IDropdownItem } from '~/components/controls/Dropdown';
import Loader from '~/components/shared/loader/Loader';
import TransitType from '~/enums/transitType';
import { INode, IStop } from '~/models';
import StopAreaService, { IStopAreaItem } from '~/services/stopAreaService';
import StopService, { IStopSectionItem } from '~/services/stopService';
import { CodeListStore } from '~/stores/codeListStore';
import { NodeStore } from '~/stores/nodeStore';
import StopForm from './StopForm';

interface IStopViewProps {
    node: INode;
    isNewStop: boolean;
    nodeStore?: NodeStore;
    codeListStore?: CodeListStore;
    nodeInvalidPropertiesMap: object;
    isTransitToggleButtonBarVisible?: boolean;
    onNodePropertyChange?: (property: keyof INode) => (value: any) => void;
    toggleTransitType?: (type: TransitType) => void;
}

interface IStopViewState {
    isLoading: boolean;
    stopSections: IDropdownItem[];
}

@inject('nodeStore', 'codeListStore')
@observer
class StopView extends React.Component<IStopViewProps, IStopViewState> {
    private nodeListener: IReactionDisposer;
    private _isMounted: boolean;

    constructor(props: IStopViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            stopSections: []
        };
    }

    async componentDidMount() {
        this._isMounted = true;
        this.nodeListener = reaction(() => this.props.nodeStore!.node, this.onNodeChange);
        if (this.props.isNewStop) {
            this.props.nodeStore!.fetchAddressData();
        }
        const stopAreas: IStopAreaItem[] = await StopAreaService.fetchAllStopAreas();
        const stopSections: IStopSectionItem[] = await StopService.fetchAllStopSections();

        if (this._isMounted) {
            this.setState({
                stopSections: this.createStopSectionDropdownItems(stopSections)
            });
            this.props.nodeStore!.setStopAreaItems(stopAreas);
            this.setState({ isLoading: false });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.nodeListener();
    }

    private onNodeChange = async () => {
        if (
            !this.props.nodeStore!.node ||
            (!this.props.isNewStop && this.props.nodeStore!.isEditingDisabled)
        ) {
            return;
        }
        await this.props.nodeStore!.fetchAddressData();
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

    private updateStopProperty = (property: keyof IStop) => (value: any) => {
        this.props.nodeStore!.updateStopProperty(property, value);
    };

    private setCurrentStateIntoNodeCache = () => {
        if (this.props.nodeStore!.isDirty) {
            this.props.nodeStore!.setCurrentStateIntoNodeCache({ isNewNode: this.props.isNewStop });
        }
    };

    render() {
        const isEditingDisabled = this.props.nodeStore!.isEditingDisabled;
        const invalidPropertiesMap = this.props.nodeStore!.stopInvalidPropertiesMap;
        const { node, isNewStop, onNodePropertyChange, toggleTransitType } = this.props;

        if (this.state.isLoading) {
            return <Loader size='small' />;
        }

        return (
            <StopForm
                node={node}
                isNewStop={isNewStop}
                isEditingDisabled={isEditingDisabled}
                stopAreas={this.props.nodeStore!.stopAreaItems}
                stopSections={this.state.stopSections}
                stopInvalidPropertiesMap={invalidPropertiesMap}
                nodeInvalidPropertiesMap={this.props.nodeInvalidPropertiesMap}
                isTransitToggleButtonBarVisible={this.props.isTransitToggleButtonBarVisible}
                toggleTransitType={toggleTransitType}
                updateStopProperty={this.updateStopProperty}
                onNodePropertyChange={onNodePropertyChange}
                setCurrentStateIntoNodeCache={this.setCurrentStateIntoNodeCache}
            />
        );
    }
}

export default StopView;
