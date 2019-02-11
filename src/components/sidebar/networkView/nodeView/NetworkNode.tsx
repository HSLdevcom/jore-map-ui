import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import { INode } from '~/models';
import { NodeStore } from '~/stores/nodeStore';
import { MapStore } from '~/stores/mapStore';
import LinkService from '~/services/linkService';
import { Button, Dropdown } from '~/components/controls';
import NodeType from '~/enums/nodeType';
import { ErrorStore } from '~/stores/errorStore';
import NodeService from '~/services/nodeService';
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
    errorStore?: ErrorStore;
}

interface InetworkNodeState {
    isLoading: boolean;
    isEditDisabled: boolean;
}

@inject('nodeStore', 'mapStore', 'errorStore')
@observer
class NetworkNode extends React.Component<INetworkNodeProps, InetworkNodeState> {
    constructor(props: INetworkNodeProps) {
        super(props);
        this.state = {
            isLoading: false,
            isEditDisabled: false,
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
        try {
            const node = await NodeService.fetchNode(nodeId);
            this.props.nodeStore!.setNode(node);
        } catch (ex) {
            this.props.errorStore!.push('Solmun haku ei onnistunut');
        }
    }

    private async fetchLinksForNode(node: INode) {
        try {
            const links = await LinkService.fetchLinksWithStartNodeOrEndNode(node.id);
            this.props.nodeStore!.setLinks(links);
        } catch (ex) {
            this.props.errorStore!.push(
                // tslint:disable-next-line:max-line-length
                `Haku löytää linkkejä, joilla lnkalkusolmu tai lnkloppusolmu on ${node.id} (soltunnus), ei onnistunut.`,
            );
        }
    }

    private onChangeLocations = (coordinatesType: NodeLocationType, coordinates: L.LatLng) => {
        const node = { ...this.props.nodeStore!.node, [coordinatesType]:coordinates };
        this.props.nodeStore!.setNode(node);
    }

    private onChange = (property: string) => (value: any) => {
        return;
    }

    private save = () => () => {};

    componentWillUnmount() {
        this.props.nodeStore!.clear();
    }

    render() {
        const node = this.props.nodeStore!.node;
        const isEditingDisabled = this.state.isEditDisabled;

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
                        closePromptMessage={undefined}
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
                            />
                        </div>
                        { node.type === NodeType.STOP &&
                            <StopForm
                                isEditingDisabled={false}
                                onChange={this.onChange}
                                stop={node.stop!}
                            />
                        }
                    </div>
                </div>
                <Button
                    type={ButtonType.SAVE}
                    disabled={true}
                    onClick={this.save}
                >
                    Tallenna muutokset
                </Button>
            </div>
        );
    }
}

export default NetworkNode;
