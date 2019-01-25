import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import moment from 'moment';
import ButtonType from '~/enums/buttonType';
import RouteService from '~/services/routeService';
import { IRoutePathLink, IRoute } from '~/models';
import RoutePathLinkService from '~/services/routePathLinkService';
import NodeType from '~/enums/nodeType';
import { Checkbox, Dropdown, Button, TransitToggleButtonBar } from '../../controls';
import InputContainer from '../InputContainer';
import MultiTabTextarea from '../routeLinkView/MultiTabTextarea';
import Loader from '../../shared/loader/Loader';
import ViewHeader from '../ViewHeader';
import * as s from './linkView.scss';

interface ILinkViewState {
    routePathLink: IRoutePathLink | null;
    route: IRoute | null;
    isLoading: boolean;
}

interface ILinkViewProps {
    match?: match<any>;
}

const nodeDescriptions = {
    stop: 'Pysäkki',
    stopNotInUse: 'Pysäkki - Ei käytössä',
    crossroad: 'Risteys',
    border: 'Raja',
    unknown: 'Tyhjä',
};

@observer
class LinkView extends React.Component<ILinkViewProps, ILinkViewState> {
    constructor(props: ILinkViewProps) {
        super(props);
        this.state = {
            routePathLink: null,
            route: null,
            isLoading: true,
        };
    }

    componentDidMount() {
        const routeLinkId = this.props.match!.params.id;
        if (routeLinkId) {
            this.fetchRoutePathLink(routeLinkId);
        }
    }

    componentWillReceiveProps(props: ILinkViewProps) {
        const routeLinkId = props.match!.params.id;
        if (routeLinkId) {
            this.fetchRoutePathLink(routeLinkId);
        }
    }

    private getRoutePath = () => {
        if (this.state.route && this.state.routePathLink) {
            return this.state.route.routePaths
                .find(p =>
                    p.routeId === this.state.routePathLink!.routeId &&
                    p.direction === this.state.routePathLink!.routePathDirection &&
                    p.startTime.getTime()
                    === this.state.routePathLink!.routePathStartDate!.getTime(),
                );
        }
        return;
    }

    private fetchRoutePathLink = async (id: string) => {
        this.setState({ isLoading: true });

        const routePathLinkId = parseInt(id, 10);
        const routePathLink =
            await RoutePathLinkService.fetchRoutePathLink(routePathLinkId);

        if (routePathLink) {
            this.setState({ routePathLink });

            if (routePathLink.routeId) {
                const route = await RouteService.fetchRoute(routePathLink.routeId!);
                if (route) {
                    this.setState({ route });
                }
            }
        }
        this.setState({ isLoading: false });
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

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.linkView, s.form)}>
                    <Loader />
                </div>
            );
        }

        const startNode = this.state.routePathLink!.startNode;
        const endNode = this.state.routePathLink!.endNode;
        const route = this.state.route;
        const routePath = this.getRoutePath();

        return (
        <div className={classnames(s.linkView, s.form)}>
            <ViewHeader>
                Reitinlinkki ${this.state.routePathLink!.id}
            </ViewHeader>
            <div className={s.topic}>
                REITIN SUUNNAN TIEDOT
            </div>
            <div className={classnames(s.flexRow, s.formSection)}>
                <div className={s.column}>
                    <div className={s.flexInnerRow}>
                        <InputContainer
                            label='REITTITUNNUS'
                            disabled={true}
                            value={this.state.routePathLink!.routeId}
                        />
                        <InputContainer
                            label='SUUNTA'
                            disabled={true}
                            value={`Suunta ${routePath ? routePath.direction : '?'}`}
                        />
                    </div>
                    <div className={s.flexInnerRow}>
                        <InputContainer
                            label='VOIM. AST'
                            disabled={true}
                            value={
                                routePath ? moment(
                                    routePath.startTime,
                                ).format('DD.MM.YYYY') : ''}
                        />
                        <InputContainer
                            label='VIIM. VOIM'
                            disabled={true}
                            value={
                                routePath ? moment(
                                    routePath.endTime,
                                ).format('DD.MM.YYYY') : ''}
                        />
                    </div>
                    <InputContainer
                        label='NIMI'
                        disabled={true}
                        value={route ? route.routeName : ''}
                    />
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRow}>
                        <div className={s.formItem}>
                            <div className={s.inputLabel}>
                                TIEDOT
                            </div>
                            <input
                                placeholder=''
                                type='text'
                                className={s.textArea}
                                readOnly={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <div className={s.topic}>
                        REITIN LINKKI
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRowFlexEnd}>
                        <InputContainer
                            label='ALKU'
                            disabled={true}
                            value={startNode ? startNode.id : '-'}
                        />
                        <Dropdown
                            onChange={this.onChange}
                            items={Object.values(nodeDescriptions)}
                            selected={
                                startNode
                                    ? this.getNodeDescription(startNode.type)
                                    : nodeDescriptions.unknown}
                        />
                        <InputContainer
                            label=''
                            disabled={true}
                            value={
                                startNode && startNode.stop ? startNode.stop!.nameFi : '-'}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRowFlexEnd}>
                        <InputContainer
                            label='LOPPU'
                            disabled={true}
                            value={endNode ? endNode.id : '-'}
                        />
                        <Dropdown
                            onChange={this.onChange}
                            items={Object.values(nodeDescriptions)}
                            selected={
                                endNode
                                    ? this.getNodeDescription(endNode.type)
                                    : nodeDescriptions.unknown}
                        />
                        <InputContainer
                            label=''
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
                    <Dropdown
                        label='AJANTASAUSPYSÄKKI'
                        onChange={this.onChange}
                        items={['Kyllä', 'Ei']}
                        selected={
                            this.state.routePathLink!.isStartNodeTimeAlignmentStop ? 'Kyllä' : 'Ei'
                        }
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
                                selectedTransitTypes={route ? [route.line!.transitType] : []}
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
                        placeholder='2'
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='KATU'
                        placeholder='Rautatientori'
                    />
                    <InputContainer
                        label='KATUOSAN OS. NRO'
                        placeholder='1'
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
                    <div className={s.formItem}>
                        <div className={s.inputLabel}>
                            ALKUSOLMUN SÄDE JA PAIKKA
                        </div>
                        <div className={s.flexInnerRow}>
                            <input
                                placeholder=''
                                type='text'
                                className={s.mediumSmallInput}
                            />
                            <input
                                placeholder='1RT'
                                type='text'
                                className={s.mediumSmallInput}
                            />
                        </div>
                    </div>
                    <div className={s.formItem}>
                        <div className={s.inputLabel}>
                            LOPPUSOLMUN SÄDE JA PAIKKA
                        </div>
                        <div className={s.flexInnerRow}>
                            <input
                                placeholder=''
                                type='text'
                                className={s.mediumSmallInput}
                            />
                            <input
                                placeholder='1RT'
                                type='text'
                                className={s.mediumSmallInput}
                            />
                        </div>
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
                        placeholder='Vuori Tuomas'
                    />
                    <InputContainer
                        label='PÄIVITYSPVM'
                        placeholder='23.08.2017'
                    />
                </div>
            </div>
            <MultiTabTextarea
                tabs={['Tariffialueet', 'Määränpäät', 'Ajoajat']}
            />
            <div className={s.buttonBar}>
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                >
                    Seuraava
                </Button>
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                >
                    Edellinen
                </Button>
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                >
                    Alkusolmu
                </Button>
                <Button
                    onClick={this.onChange}
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
