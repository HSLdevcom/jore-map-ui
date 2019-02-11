import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import { INode } from '~/models';
import { NodeStore } from '~/stores/nodeStore';
import { MapStore } from '~/stores/mapStore';
import LinkService from '~/services/linkService';
import NotificationType from '~/enums/notificationType';
import { IValidationResult } from '~/validation/FormValidator';
import { Button, Dropdown } from '~/components/controls';
import FormBase from '~/components/shared/inheritedComponents/FormBase';
import NodeType from '~/enums/nodeType';
import NodeService from '~/services/nodeService';
import { NotificationStore } from '~/stores/notificationStore';
import nodeTypeCodeList from '~/codeLists/nodeTypeCodeList';
import NodeLocationType from '~/types/NodeLocationType';
import ButtonType from '~/enums/buttonType';
import Loader from '~/components/shared/loader/Loader';
import NodeCoordinatesListView from './NodeCoordinatesListView';
import ViewHeader from '../../ViewHeader';
import StopForm from './StopForm';
import InputContainer from '../../InputContainer';
import * as s from './networkNode.scss';

interface INetworkNodeProps {
    match?: match<any>;
    nodeStore?: NodeStore;
    mapStore?: MapStore;
    notificationStore?: NotificationStore;
}

interface INetworkNodeState {
    isLoading: boolean;
    isEditingDisabled: boolean;
    invalidFieldsMap: object;
}

@inject('nodeStore', 'mapStore', 'notificationStore')
@observer
class NetworkNode extends FormBase<INetworkNodeProps, INetworkNodeState> {
    constructor(props: INetworkNodeProps) {
        super(props);
        this.state = {
            isLoading: false,
            isEditingDisabled: true,
            invalidFieldsMap: {},
        };
    }

    async componentDidMount() {
        const selectedNodeId = this.props.match!.params.id;

        this.setState({ isLoading: true });
        if (selectedNodeId) {
            this.props.mapStore!.setSelectedNodeId(selectedNodeId);
            await this.queryNode(selectedNodeId);
        }
        const node = this.props.nodeStore!.node;
        if (node) {
            await this.fetchLinksForNode(node);
            this.props.mapStore!.setCoordinates(node.coordinates);
        }
        this.setState({ isLoading: false });
    }

    private async queryNode(nodeId: string) {
        const node = await NodeService.fetchNode(nodeId);
        if (node) {
            this.props.nodeStore!.setNode(node);
        }
    }

    private async fetchLinksForNode(node: INode) {
        const links = await LinkService.fetchLinksWithStartNodeOrEndNode(node.id);
        if (links) {
            this.props.nodeStore!.setLinks(links);
        }
    }

    private onChangeLocations = (coordinatesType: NodeLocationType, coordinates: L.LatLng) => {
        this.props.nodeStore!.updateNode(coordinatesType, coordinates);
    }

    private save = async () => {
        this.setState({ isLoading: true });
        try {
            await NodeService.updateNode(this.props.nodeStore!.node);

            this.props.nodeStore!.setOldNode(this.props.nodeStore!.node);
            this.props.notificationStore!.addNotification({
                message: 'Tallennus onnistui',
                type: NotificationType.SUCCESS,
            });
        } catch (err) {
            const errMessage = err.message ? `, (${err.message})` : '';
            this.props.notificationStore!.addNotification({
                message: `Tallennus epäonnistui${errMessage}`,
                type: NotificationType.ERROR,
            });
        }
        this.setState({ isLoading: false });
    }

    private onChange = (property: string) => (value: any, validationResult?: IValidationResult) => {
        this.props.nodeStore!.updateNode(property, value);
        if (validationResult) {
            this.markInvalidFields(property, validationResult!.isValid);
        }
    }

    private onStopChange =
        (property: string) => (value: any, validationResult?: IValidationResult) => {
            this.props.nodeStore!.updateStop(property, value);
            if (validationResult) {
                this.markInvalidFields(property, validationResult!.isValid);
            }
        }

    private onEditButtonClick = () => {
        this.toggleIsEditingDisabled(
            this.props.nodeStore!.undoChanges,
        );
    }

    componentWillUnmount() {
        this.props.nodeStore!.clear();
    }

    render() {
        const node = this.props.nodeStore!.node;
        const isEditingDisabled = this.state.isEditingDisabled;

        const isSaveButtonDisabled = this.state.isEditingDisabled
            || !this.props.nodeStore!.isDirty
            || !this.isFormValid();

        // tslint:disable-next-line:max-line-length
        const message = 'Solmulla on tallentamattomia muutoksia. Oletko varma, että poistua näkymästä? Tallentamattomat muutokset kumotaan.';

        if (this.state.isLoading || !node || !node.id) {
            return(
                <div className={classnames(s.networkNodeView, s.loaderContainer)}>
                    <Loader/>
                </div>
            );
        }
        return (
            <div className={s.networkNodeView}>
                <div className={s.content}>
                    <ViewHeader
                        closePromptMessage={
                            this.props.nodeStore!.isDirty ? message : undefined
                        }
                        showEditButton={true}
                        isEditing={!isEditingDisabled}
                        onEditButtonClick={this.onEditButtonClick}
                    >
                        Solmu {node.id}
                    </ViewHeader>
                    <div className={s.form}>
                        <div className={s.formSection}>
                            <div className={s.flexRow}>
                                <InputContainer
                                    label='LYHYT ID'
                                    disabled={isEditingDisabled}
                                    value={node.shortId}
                                    onChange={this.onChange('routePathShortName')}
                                />
                                <Dropdown
                                    label='TYYPPI'
                                    onChange={this.onChange('type')}
                                    disabled={isEditingDisabled}
                                    selected={node.type}
                                    codeList={nodeTypeCodeList}
                                />
                            </div>
                        </div>
                        <div className={s.formSection}>
                            <NodeCoordinatesListView
                                node={this.props.nodeStore!.node}
                                onChangeCoordinates={this.onChangeLocations}
                                isEditingDisabled={isEditingDisabled}
                            />
                        </div>
                        { node.type === NodeType.STOP &&
                            <StopForm
                                isEditingDisabled={isEditingDisabled}
                                onChange={this.onStopChange}
                                stop={node.stop!}
                            />
                        }
                    </div>
                </div>
                <Button
                    type={ButtonType.SAVE}
                    disabled={isSaveButtonDisabled}
                    onClick={this.save}
                >
                    Tallenna muutokset
                </Button>
            </div>
        );
    }
}

export default NetworkNode;
