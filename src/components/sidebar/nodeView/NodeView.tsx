import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import { SidebarStore } from '../../../stores/sidebarStore';
import { NodeStore } from '../../../stores/nodeStore';
import Loader from '../../shared/loader/Loader';
import { Button, Dropdown, ToggleSwitch } from '../../controls';
import NodeService from '../../../services/nodeService';
import ButtonType from '../../../enums/buttonType';
import TransitType from '../../../enums/transitType';
import { INode } from '../../../models';
import ViewHeader from '../ViewHeader';
import * as s from './nodeView.scss';

interface IMapInformationSource {
    selected: string;
    items: string[];
}

interface INodeViewState {
    isLoading: boolean;
    mapInformationSource: IMapInformationSource;
}

interface INodeViewProps {
    match?: match<any>;
    sidebarStore?: SidebarStore;
    nodeStore?: NodeStore;
}

@inject('sidebarStore', 'nodeStore')
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

    public componentDidMount() {
        const nodeId = this.props.match!.params.id;
        if (nodeId) {
            this.props.nodeStore!.selectedNodeId = nodeId;
            this.queryNode(nodeId);
        }
    }

    public componentWillReceiveProps(props: any) {
        const nodeId = props.match!.params.id;
        if (nodeId) {
            this.props.nodeStore!.selectedNodeId = nodeId;
            this.queryNode(nodeId);
        }
    }

    public componentWillUnmount() {
        this.props.nodeStore!.selectedNodeId = null;
    }

    private async queryNode(nodeId: string) {
        this.setState({ isLoading: true });
        const node = await NodeService.fetchNode(nodeId);
        if (node) {
            this.props.nodeStore!.addNode(node);
        }
        this.setState({ isLoading: false });
    }

    private toggleStopInUse() {
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

    private doNothing() {
        // Empty
    }

    private toggleEditing = () => {
    }

    private capitalizeFirstLetter(input: string|null) {
        if (!input) return '';
        return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    }

    private renderNodeName(node: INode|null) {
        let nodeName = null;
        if (node && node.stop && (node.stop.nameFi || node.stop.nameSe)) {
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

    private renderNodeView(node: INode|null) {
        return (
            <div>
                { node == null ? (
                    <div>
                        {this.props.nodeStore!.selectedNodeId ? (
                            <div>Solmua {this.props.nodeStore!.selectedNodeId} ei löytynyt.</div>
                        ) : (
                            <div>Solmua ei löytynyt.</div>
                        )}
                    </div>
                ) : (
                <div>
                    <ViewHeader
                        header={`Solmu ${this.renderNodeName(node)}`}
                        toggleEditing={this.toggleEditing}
                    />
                    <div
                        className={classnames(
                            s.flexRow,
                            s.stopInUseRow,
                        )}
                    >
                        <div className={s.rowElement}>
                            Pysäkki käytössä
                        </div>
                        <ToggleSwitch
                            onClick={this.toggleStopInUse}
                            value={true}
                            type={TransitType.BUS}
                            color={'#007ac9'}
                        />
                    </div>
                    <div className={s.flexRow}>
                        Sijainti: (2555744, 6675294)
                    </div>
                    <div className={s.flexInnerRow}>
                        <div className={s.flexInnerColumn}>
                            <div>Karttatietolähde</div>
                            <Dropdown
                                onChange={this.onMapInformationSourceChange}
                                items={this.state.mapInformationSource.items}
                                selected={this.state.mapInformationSource.selected}
                            />
                        </div>
                    </div>
                    <div className={s.flexInnerRow}>
                        <div className={s.flexInnerColumn}>
                            <div className={s.informationSource}>Tiedon lähde: pisteet</div>
                            <div className={s.flexInnerRow}>
                                Shape:
                            </div>
                        </div>
                    </div>
                    <div className={s.flexInnerRow}>
                        <div className={s.flexInnerColumn}>
                            9 tietolähdettä löytyi.
                            <div className={s.informationField}>
                                <div className={s.item}>Info = X/1420004</div>
                                <div className={s.item}>Nopeudet = 34km/h / 28km/h</div>
                                <div className={s.item}>Pituudet = 149m / 7376m</div>
                                <div className={s.item}>Ajoajat = 16s / 15min 42s</div>
                                <div className={s.item}>Verkko = 1</div>
                                <div className={s.item}>Loppusolmu = 1420113</div>
                                <div className={s.item}>Tyyppi = X</div>
                                <div className={s.item}>Y = 2555744</div>
                                <div className={s.item}>X = 6675295</div>
                                <div className={s.item}>Soltunnus = 1420004</div>
                                <div className={s.item}>Nimi = Kulosaarentie-Kulosaarentie</div>
                            </div>
                        </div>
                    </div>
                    <div className={s.flexInnerRow}>
                        <Button
                            onClick={this.doNothing}
                            type={ButtonType.PRIMARY}
                            text={'Poista linkki'}
                        />
                    </div>
                </div>
            )}
        </div>
        );
    }

    private getNode() {
        const selectedNodeId = this.props.nodeStore!.selectedNodeId;
        if (selectedNodeId) {
            return this.props.nodeStore!.getNode(selectedNodeId);
        }
        return null;
    }

    public render(): any {
        const node = this.getNode();
        return (
            <div className={s.nodeView}>
                { this.state.isLoading ? (
                    <Loader />
                ) : (
                    this.renderNodeView(node)
                )}
            </div>
        );
    }
}
export default NodeView;
