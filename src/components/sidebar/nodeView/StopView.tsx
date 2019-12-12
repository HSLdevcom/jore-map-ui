import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IDropdownItem } from '~/components/controls/Dropdown';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import { INode, IStop } from '~/models';
import StopAreaService, { IStopAreaItem } from '~/services/stopAreaService';
import StopService, { IStopSectionItem } from '~/services/stopService';
import { CodeListStore } from '~/stores/codeListStore';
import { NodeStore } from '~/stores/nodeStore';
import StopForm from './StopForm';
import * as s from './stopView.scss';

interface IStopViewProps {
    node: INode;
    isNewStop: boolean;
    nodeStore?: NodeStore;
    codeListStore?: CodeListStore;
    nodeInvalidPropertiesMap: object;
    onNodePropertyChange?: (property: keyof INode) => (value: any) => void;
}

interface IStopViewState {
    isLoading: boolean;
    stopSections: IDropdownItem[];
}

@inject('nodeStore', 'codeListStore')
@observer
class StopView extends React.Component<IStopViewProps, IStopViewState> {
    private nodeListener: IReactionDisposer;
    private mounted: boolean;

    constructor(props: IStopViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            stopSections: []
        };
    }

    async componentDidMount() {
        this.mounted = true;
        this.nodeListener = reaction(() => this.props.nodeStore!.node, this.onNodeChange);
        if (this.props.isNewStop) {
            this.props.nodeStore!.fetchAddressData();
        }
        const stopAreas: IStopAreaItem[] = await StopAreaService.fetchAllStopAreas();
        const stopSections: IStopSectionItem[] = await StopService.fetchAllStopSections();

        if (this.mounted) {
            this.setState({
                stopSections: this.createStopSectionDropdownItems(stopSections)
            });
            this.props.nodeStore!.setStopAreaItems(stopAreas);
            this.setState({ isLoading: false });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
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
        const { node, isNewStop, onNodePropertyChange } = this.props;

        if (this.state.isLoading) {
            return (
                <div className={s.loaderContainer}>
                    <Loader size={LoaderSize.SMALL} />
                </div>
            );
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
                updateStopProperty={this.updateStopProperty}
                onNodePropertyChange={onNodePropertyChange}
                setCurrentStateIntoNodeCache={this.setCurrentStateIntoNodeCache}
            />
        );
    }
}

export default StopView;
