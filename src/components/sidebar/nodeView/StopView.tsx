import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import Loader from '~/components/shared/loader/Loader';
import { INode, IStop, IStopArea } from '~/models';
import IHastusArea from '~/models/IHastusArea';
import StopAreaService from '~/services/stopAreaService';
import StopService, { IStopSectionItem } from '~/services/stopService';
import { AlertStore } from '~/stores/alertStore';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { NodeStore } from '~/stores/nodeStore';
import StopForm from './StopForm';

interface IStopViewProps {
    node: INode;
    isNewStop: boolean;
    nodeStore?: NodeStore;
    codeListStore?: CodeListStore;
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
}

interface IStopViewState {
    isLoading: boolean;
    stopSections: IStopSectionItem[];
    hastusAreas: IHastusArea[];
}

@inject('nodeStore', 'codeListStore', 'alertStore', 'errorStore')
@observer
class StopView extends React.Component<IStopViewProps, IStopViewState> {
    private nodeListener: IReactionDisposer;
    private _isMounted: boolean;

    constructor(props: IStopViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            stopSections: [],
            hastusAreas: [],
        };
    }

    async componentDidMount() {
        this._isMounted = true;
        this.nodeListener = reaction(() => this.props.nodeStore!.node, this.onNodeChange);
        if (this.props.isNewStop) {
            this.props.nodeStore!.updateStopPropertiesAccordingToNodeLocation();
        }
        const stopAreas: IStopArea[] = await StopAreaService.fetchAllStopAreas();
        const stopSections: IStopSectionItem[] = await StopService.fetchAllStopSections();
        const hastusAreas: IHastusArea[] = await StopService.fetchAllHastusAreas();
        if (this._isMounted) {
            this.setState({
                hastusAreas,
                stopSections,
            });
            this.props.nodeStore!.setStopAreas(stopAreas);
            this.setState({ isLoading: false });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.nodeListener();
    }

    private saveHastusArea = async ({
        isNewHastusArea,
        isHastusAreaSavedToNode,
    }: {
        isNewHastusArea: boolean;
        isHastusAreaSavedToNode: boolean;
    }) => {
        const nodeStore = this.props.nodeStore!;
        try {
            if (isNewHastusArea) {
                await StopService.createHastusArea({
                    oldHastusArea: nodeStore.oldHastusArea!,
                    newHastusArea: nodeStore.hastusArea,
                });
            } else {
                await StopService.updateHastusArea({
                    oldHastusArea: nodeStore.oldHastusArea!,
                    newHastusArea: nodeStore.hastusArea,
                });
            }
            nodeStore.updateStopProperty('hastusId', nodeStore.hastusArea.id);
            if (isHastusAreaSavedToNode) {
                nodeStore.updateOldStopProperty('hastusId', nodeStore.hastusArea.id);
            } else {
                // Make sure editing is enabled so that user will see unsaved changes
                nodeStore.setIsEditingDisabled(false);
            }
            nodeStore.setOldHastusArea(nodeStore.hastusArea);
            const hastusAreas: IHastusArea[] = await StopService.fetchAllHastusAreas();
            this.setState({
                hastusAreas,
            });
            this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
        } catch (e) {
            this.props.errorStore!.addError('', e);
        }
    };

    private onNodeChange = async () => {
        if (
            !this.props.nodeStore!.node ||
            (!this.props.isNewStop && this.props.nodeStore!.isEditingDisabled)
        ) {
            return;
        }
        await this.props.nodeStore!.updateStopPropertiesAccordingToNodeLocation();
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
        const { node, isNewStop } = this.props;

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
                saveHastusArea={this.saveHastusArea}
                stopInvalidPropertiesMap={invalidPropertiesMap}
                updateStopProperty={this.updateStopProperty}
                setCurrentStateIntoNodeCache={this.setCurrentStateIntoNodeCache}
            />
        );
    }
}

export default StopView;
