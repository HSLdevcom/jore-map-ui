import React from 'react';
import Moment from 'moment';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import L from 'leaflet';
import ButtonType from '~/enums/buttonType';
import { ILink, INode } from '~/models';
import LinkService from '~/services/linkService';
import NodeType from '~/enums/nodeType';
import SubSites from '~/routing/subSites';
import routeBuilder from '~/routing/routeBuilder';
import navigator from '~/routing/navigator';
import MunicipalityDropdown from '~/components/controls/MunicipalityDropdown';
import { EditNetworkStore } from '~/stores/editNetworkStore';
import { MapStore } from '~/stores/mapStore';
import NodeService from '~/services/nodeService';
import { Checkbox, Dropdown, Button, TransitToggleButtonBar } from '../../../controls';
import InputContainer from '../../InputContainer';
import MultiTabTextarea from './MultiTabTextarea';
import Loader from '../../../shared/loader/Loader';
import ViewHeader from '../../ViewHeader';
import * as s from './linkView.scss';

interface ILinkViewState {
    link?: ILink;
    isLoading: boolean;
}

interface ILinkViewProps {
    match?: match<any>;
    editNetworkStore?: EditNetworkStore;
    mapStore?: MapStore;
}

const nodeDescriptions = {
    stop: 'Pysäkki',
    stopNotInUse: 'Pysäkki - Ei käytössä',
    crossroad: 'Risteys',
    border: 'Raja',
    unknown: 'Tyhjä',
};

@inject('editNetworkStore', 'mapStore')
@observer
class LinkView extends React.Component<ILinkViewProps, ILinkViewState> {
    constructor(props: ILinkViewProps) {
        super(props);
        this.state = {
            isLoading: true,
        };
    }

    async componentDidMount() {
        await this.initUsingUrlParams(this.props);
        if (this.state.link) {
            const bounds = L.latLngBounds(this.state.link.geometry);
            this.props.mapStore!.setMapBounds(bounds);
        }
    }

    componentWillReceiveProps(props: ILinkViewProps) {
        this.initUsingUrlParams(props);
    }

    private initUsingUrlParams = async (props: ILinkViewProps) => {
        this.setState({ isLoading: true });
        const [startNodeId, endNodeId, transitTypeCode] = props.match!.params.id.split(',');
        if (startNodeId && endNodeId && transitTypeCode) {
            await this.fetchLink(startNodeId, endNodeId, transitTypeCode);
        }
        this.fetchNodes([this.state.link!.startNode.id, this.state.link!.endNode.id]);
        this.setState({ isLoading: false });
    }

    private fetchLink = async (startNodeId: string, endNodeId: string, transitTypeCode: string) => {
        const link =
            await LinkService.fetchLink(startNodeId, endNodeId, transitTypeCode);

        if (link) {
            this.setState({ link });
            this.props.editNetworkStore!.setLinks([link]);
        }
    }

    private fetchNodes = async (nodeIds: string[]) => {
        const nodes = await Promise.all(nodeIds.map(id => NodeService.fetchNode(id)));
        this.props.editNetworkStore!.setNodes(nodes.filter(n => Boolean(n)) as INode[]);
    }

    private getNodeDescription = (nodeType: NodeType) => {
        switch (nodeType) {
        case NodeType.STOP:
            return nodeDescriptions.stop;
        case NodeType.DISABLED:
            return nodeDescriptions.stopNotInUse;
        case NodeType.MUNICIPALITY_BORDER:
            return nodeDescriptions.border;
        case NodeType.CROSSROAD:
            return nodeDescriptions.crossroad;
        default:
            return nodeDescriptions.unknown;
        }
    }

    // TODO
    private onChange = () => {
    }

    private navigateToNode = (nodeId: string) => () => {
        const editNetworkLink = routeBuilder
            .to(SubSites.networkNode)
            .toTarget(nodeId)
            .toLink();
        navigator.goTo(editNetworkLink);
    }

    componentWillUnmount() {
        this.props.editNetworkStore!.clear();
    }

    render() {
        if (this.state.isLoading || !this.state.link) {
            return (
                <div className={classnames(s.linkView, s.loaderContainer)}>
                    <Loader />
                </div>
            );
        }

        const startNode = this.state.link!.startNode;
        const endNode = this.state.link!.endNode;
        const datetimeStringDisplayFormat = 'YYYY-MM-DD HH:mm:ss';

        return (
        <div className={classnames(s.linkView)}>
            <ViewHeader>
                Linkki
            </ViewHeader>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRowFlexEnd}>
                        <InputContainer
                            label='ALKUSOLMU'
                            disabled={true}
                            value={startNode ? startNode.id : '-'}
                        />
                        <Dropdown
                            label='TYYPPI'
                            onChange={this.onChange}
                            items={Object.values(nodeDescriptions)}
                            disabled={true}
                            selected={
                                startNode
                                    ? this.getNodeDescription(startNode.type)
                                    : nodeDescriptions.unknown}
                        />
                        <InputContainer
                            label='NIMI'
                            disabled={true}
                            value={
                                startNode && startNode.stop ? startNode.stop!.nameFi : '-'}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRowFlexEnd}>
                        <InputContainer
                            label='LOPPUSOLMU'
                            disabled={true}
                            value={endNode ? endNode.id : '-'}
                        />
                        <Dropdown
                            label='TYYPPI'
                            onChange={this.onChange}
                            items={Object.values(nodeDescriptions)}
                            disabled={true}
                            selected={
                                endNode
                                    ? this.getNodeDescription(endNode.type)
                                    : nodeDescriptions.unknown}
                        />
                        <InputContainer
                            label='NIMI'
                            disabled={true}
                            value={endNode && endNode.stop ? endNode.stop!.nameFi : '-'}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <Dropdown
                        label='KUTSU-/JÄTTÖ-/OTTOP'
                        onChange={this.onChange}
                        items={['Ei', 'Kyllä']}
                        selected={'0 - Ei'}
                    />
                    <div className={s.formItem} />
                </div>
                <div className={s.flexRow}>
                    <div className={s.formItem}>
                        <div className={s.inputLabel}>
                            VERKKO
                        </div>
                        <div className={s.transitButtonBar}>
                            <TransitToggleButtonBar
                                selectedTransitTypes={
                                  this.state.link ? [this.state.link!.transitType] : []
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='SUUNTA'
                        placeholder='Suunta 1'
                    />
                    <InputContainer
                        label='OS. NRO'
                        placeholder='2 B'
                    />
                    <InputContainer
                        label='LINKIN PITUUS'
                        value={this.state.link.length}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='KATU'
                        value={this.state.link.streetName}
                    />
                    <InputContainer
                        label='KATUOSAN OS. NRO'
                        value={this.state.link.streetNumber}
                    />
                    <MunicipalityDropdown
                        onChange={this.onChange}
                        value={this.state.link.municipalityCode}
                        label='KUNTA'
                    />
                </div>
                <div className={s.flexRow}>
                    <div className={s.inputLabel}>
                        ALKUSOLMUN SARAKE NRO
                    </div>
                    <div className={s.inputLabel}>
                        VIIM. LINKIN LOPPUSOLMU SARAKE NRO
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRow}>
                        <input
                            placeholder='1'
                            type='text'
                            className={s.smallInput}
                        />
                        <Checkbox
                            checked={false}
                            text={'Ohitusaika kirja-aikat.'}
                            onClick={this.onChange}
                        />
                    </div>
                    <div className={s.flexInnerRow}>
                        <input
                            placeholder='1'
                            type='text'
                            className={s.smallInput}
                        />
                        <Checkbox
                            checked={false}
                            text={'Ohitusaika kirja-aikat.'}
                            onClick={this.onChange}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRow}>
                        <input
                            placeholder='1'
                            type='text'
                            className={s.smallInput}
                        />
                        <Checkbox
                            checked={false}
                            text={'Ohitusaika nettiaikat.'}
                            onClick={this.onChange}
                        />
                    </div>
                    <div className={s.flexInnerRow}>
                        <input
                            placeholder='1'
                            type='text'
                            className={s.smallInput}
                        />
                        <Checkbox
                            checked={false}
                            text={'Ohitusaika nettiaikat.'}
                            onClick={this.onChange}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexGrow}>
                        <Dropdown
                            label='SOLMU HASTUS-PAIKKANA'
                            onChange={this.onChange}
                            items={['Kyllä', 'Ei']}
                            selected={'Kyllä'}
                        />
                    </div>
                    <div className={s.flexFiller} />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='PÄIVITTÄJÄ'
                        value={this.state.link.modifiedBy}
                    />
                    <InputContainer
                        label='PÄIVITYSPVM'
                        value={Moment(this.state.link.modifiedOn)
                          .format(datetimeStringDisplayFormat)}
                    />
                </div>
            </div>
            <MultiTabTextarea
                tabs={['Tariffialueet', 'Määränpäät', 'Ajoajat']}
            />
            <div className={s.buttonBar}>
                <Button
                    onClick={this.navigateToNode(this.state.link.startNode.id)}
                    type={ButtonType.ROUND}
                >
                    Alkusolmu
                </Button>
                <Button
                    onClick={this.navigateToNode(this.state.link.endNode.id)}
                    type={ButtonType.ROUND}
                >
                    Loppusolmu
                </Button>
            </div>
        </div>
        );
    }
}
export default LinkView;
