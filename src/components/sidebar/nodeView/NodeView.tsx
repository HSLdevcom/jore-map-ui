import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import { MapStore } from '~/stores/mapStore';
import NodeService from '~/services/nodeService';
import { INode } from '~/models';
import NodeLocationType from '~/types/NodeLocationType';
import NodeMockData from './NodeMockData';
import NodeCoordinatesListView from '../networkView/nodeView/NodeCoordinatesListView';
import Loader from '../../shared/loader/Loader';
import { ToggleSwitch } from '../../controls';
import ViewHeader from '../ViewHeader';
import * as s from './nodeView.scss';

export interface IMapInformationSource {
    selected: string;
    items: string[];
}

interface INodeViewState {
    isLoading: boolean;
    mapInformationSource: IMapInformationSource;
    node?: INode;
}

interface INodeViewProps {
    match?: match<any>;
    mapStore?: MapStore;
}

@inject('mapStore')
@observer
class NodeView extends React.Component
<INodeViewProps, INodeViewState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            mapInformationSource: {
                selected: 'X/1420004',
                items: ['X/1420001', 'X/1420002', 'X/1420003', 'X/1420004', 'X/1420005'],
            },
        };
    }

    async componentDidMount() {
        const selectedNodeId = this.props.match!.params.id;
        if (selectedNodeId) {
            this.props.mapStore!.setSelectedNodeId(selectedNodeId);
            await this.queryNode(selectedNodeId);
        }
    }

    componentWillReceiveProps(props: INodeViewProps) {
        const nodeId = props.match!.params.id;
        if (nodeId) {
            this.props.mapStore!.setSelectedNodeId(nodeId);
            this.queryNode(nodeId);
        }
    }

    componentWillUnmount() {
        this.props.mapStore!.setSelectedNodeId(null);
    }

    private queryNode = async (nodeId: string) => {
        this.setState({ isLoading: true });

        const node = await NodeService.fetchNode(nodeId);
        if (node) {
            this.setState({ node });
        }

        this.setState({ isLoading: false });
    }

    private toggleStopInUse = () => {
        // Todo
    }

    private onMapInformationSourceChange = (selectedItem: string) => {
        this.setState({
            mapInformationSource: {
                ...this.state.mapInformationSource,
                selected: selectedItem,
            },
        });
    }

    private capitalizeFirstLetter = (input: string|null) => {
        if (!input) return '';
        return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    }

    private renderNodeName = (node: INode) => {
        let nodeName = null;
        if (node.stop && (node.stop.nameFi || node.stop.nameSe)) {
            if (node.stop.nameFi) nodeName = node.stop.nameFi;
            else if (node.stop.nameSe) nodeName = node.stop.nameSe;
        }

        if (nodeName) {
            return (
                this.capitalizeFirstLetter(nodeName)
            );
        }
        return 'Nimi puuttuu';
    }

    private renderToggleStopInUse = () => (
        <>
        <div className={s.rowElement}>
            Pysäkki käytössä
        </div>
        <ToggleSwitch
            onClick={this.toggleStopInUse}
            value={true}
            color={'#007ac9'}
        />
        </>
    )

    private renderNodeView = (node: INode) => {
        return (
                <div>
                    <ViewHeader>
                        Solmu {this.renderNodeName(node)}
                    </ViewHeader>
                    <div
                        className={classnames(
                            s.flexRow,
                            s.stopInUseRow,
                        )}
                    >
                        {node.stop && this.renderToggleStopInUse()}
                    </div>
                    <NodeCoordinatesListView
                        node={this.state.node!}
                        onChangeCoordinates={this.onChangeLocations}
                    />
                    <NodeMockData
                        onMapInformationSourceChange={this.onMapInformationSourceChange}
                        mapInformationSource={this.state.mapInformationSource}
                    />
                </div>
        );
    }

    private onChangeLocations = (coordinatesType: NodeLocationType, coordinates: L.LatLng) => {
        const node = { ...this.state.node!, [coordinatesType]:coordinates };
        this.setState({ node });
    }

    render() {
        const selectedNodeId = this.props.match!.params.id;
        return (
            <div className={s.nodeView}>
                { this.state.isLoading ? (
                    <Loader />
                ) : (
                    !this.state.node ? (
                        selectedNodeId ? (
                            <div>
                                Solmua {selectedNodeId} ei löytynyt.
                            </div>
                        ) : (
                            <div>Solmua ei löytynyt.</div>
                        )
                    ) : (
                    this.renderNodeView(this.state.node)
                    )
                )}
            </div>
        );
    }
}
export default NodeView;
