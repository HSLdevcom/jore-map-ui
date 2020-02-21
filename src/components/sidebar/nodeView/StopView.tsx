import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import Loader from '~/components/shared/loader/Loader';
import TransitType from '~/enums/transitType';
import { INode, IStop, IStopArea } from '~/models';
import IHastusArea from '~/models/IHastusArea';
import StopAreaService from '~/services/stopAreaService';
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
    saveHastusArea: ({ isNewHastusArea }: { isNewHastusArea: boolean }) => void;
    isTransitToggleButtonBarVisible?: boolean;
    onNodePropertyChange?: (property: keyof INode) => (value: any) => void;
    toggleTransitType?: (type: TransitType) => void;
}

interface IStopViewState {
    isLoading: boolean;
    stopSections: IStopSectionItem[];
    hastusAreas: IHastusArea[];
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
            stopSections: [],
            hastusAreas: []
        };
    }

    async componentDidMount() {
        this._isMounted = true;
        this.nodeListener = reaction(() => this.props.nodeStore!.node, this.onNodeChange);
        if (this.props.isNewStop) {
            this.props.nodeStore!.fetchAddressData();
        }
        const stopAreas: IStopArea[] = await StopAreaService.fetchAllStopAreas();
        const stopSections: IStopSectionItem[] = await StopService.fetchAllStopSections();
        const hastusAreas: IHastusArea[] = await StopService.fetchAllHastusAreas();
        if (this._isMounted) {
            this.setState({
                hastusAreas,
                stopSections
            });
            this.props.nodeStore!.setStopAreas(stopAreas);
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
                stopAreas={this.props.nodeStore!.stopAreas}
                stopSections={this.state.stopSections}
                hastusAreas={this.state.hastusAreas}
                saveHastusArea={this.props.saveHastusArea}
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
