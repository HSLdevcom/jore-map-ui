import React from 'react';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import moment from 'moment';
import ButtonType from '~/enums/buttonType';
import RouteService from '~/services/routeService';
import { IRoutePathLink, IRoute } from '~/models';
import nodeTypeCodeList from '~/codeLists/nodeTypeCodeList';
import booleanCodeList from '~/codeLists/booleanCodeList';
import { ErrorStore } from '~/stores/errorStore';
import RoutePathLinkService from '~/services/routePathLinkService';
import { Checkbox, Dropdown, Button, TransitToggleButtonBar } from '../../controls';
import InputContainer from '../InputContainer';
import TextContainer from '../TextContainer';
import Loader from '../../shared/loader/Loader';
import SidebarHeader from '../SidebarHeader';
import MultiTabTextarea from '../linkView/MultiTabTextarea';
import * as s from './routeLinkView.scss';

interface IRouteLinkViewState {
    routePathLink: IRoutePathLink | null;
    route: IRoute | null;
    isLoading: boolean;
}

interface IRouteLinkViewProps {
    match?: match<any>;
    errorStore?: ErrorStore;
}

// This is basically not used,
// it is possible to open it using routepath link list,
// however, we should probable remove it
// https://github.com/HSLdevcom/jore-map-ui/issues/725
@inject('errorStore')
@observer
class RouteLinkView extends React.Component<IRouteLinkViewProps, IRouteLinkViewState> {
    constructor(props: IRouteLinkViewProps) {
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

    componentWillReceiveProps(props: IRouteLinkViewProps) {
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

        try {
            const routePathLinkId = parseInt(id, 10);
            const routePathLink =
                await RoutePathLinkService.fetchRoutePathLink(routePathLinkId);

            this.setState({ routePathLink });

            if (routePathLink.routeId) {
                const route = await RouteService.fetchRoute(routePathLink.routeId!);
                this.setState({ route });
            }
        } catch (ex) {
            this.props.errorStore!.addError('Reitinsuunnan linkin haku epäonnistui', ex);
        }

        this.setState({ isLoading: false });
    }

    // TODO
    private onChange = (value?: any) => {
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
            <SidebarHeader>
                Reitinlinkki {this.state.routePathLink!.id}
            </SidebarHeader>
            <div className={s.topic}>
                REITIN SUUNNAN TIEDOT
            </div>
            <div className={classnames(s.flexRow, s.formSection)}>
                <div className={s.column}>
                    <div className={s.flexInnerRow}>
                        <TextContainer
                            label='REITTITUNNUS'
                            value={this.state.routePathLink!.routeId}
                        />
                        <TextContainer
                            label='SUUNTA'
                            value={`Suunta ${routePath ? routePath.direction : '?'}`}
                        />
                    </div>
                    <div className={s.flexInnerRow}>
                        <TextContainer
                            label='VOIM. AST'
                            value={
                                routePath ? moment(
                                    routePath.startTime,
                                ).format('DD.MM.YYYY') : ''}
                        />
                        <TextContainer
                            label='VIIM. VOIM'
                            value={
                                routePath ? moment(
                                    routePath.endTime,
                                ).format('DD.MM.YYYY') : ''}
                        />
                    </div>
                    <TextContainer
                        label='NIMI'
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
                        <TextContainer
                            label='ALKU'
                            value={startNode ? startNode.id : '-'}
                        />
                        <Dropdown
                            onChange={this.onChange}
                            codeList={nodeTypeCodeList}
                            selected={startNode.type}
                        />
                        <TextContainer
                            label=''
                            value={
                                startNode && startNode.stop ? startNode.stop!.nameFi : '-'}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRowFlexEnd}>
                        <TextContainer
                            label='LOPPU'
                            value={endNode ? endNode.id : '-'}
                        />
                        <Dropdown
                            onChange={this.onChange}
                            codeList={nodeTypeCodeList}
                            selected={endNode.type}
                        />
                        <TextContainer
                            label=''
                            value={endNode && endNode.stop ? endNode.stop!.nameFi : '-'}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <Dropdown
                        label='KUTSU-/JÄTTÖ-/OTTOP'
                        onChange={this.onChange}
                        codeList={booleanCodeList}
                        selected='0'
                    />
                    <Dropdown
                        label='AJANTASAUSPYSÄKKI'
                        onChange={this.onChange}
                        codeList={booleanCodeList}
                        selected={'0'}
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
                        onChange={this.onChange}
                    />
                    <InputContainer
                        label='OS. NRO'
                        placeholder='2 B'
                        onChange={this.onChange}
                    />
                    <InputContainer
                        label='LINKIN PITUUS'
                        placeholder='2'
                        onChange={this.onChange}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='KATU'
                        placeholder='Rautatientori'
                        onChange={this.onChange}
                    />
                    <InputContainer
                        label='KATUOSAN OS. NRO'
                        placeholder='1'
                        onChange={this.onChange}
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
                            text='Ohitusaika kirja-aikat.'
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
                            text='Ohitusaika kirja-aikat.'
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
                            text='Ohitusaika nettiaikat.'
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
                            text='Ohitusaika nettiaikat.'
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
                            codeList={booleanCodeList}
                            selected='0'
                        />
                    </div>
                    <div className={s.flexFiller} />
                </div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='PÄIVITTÄJÄ'
                        value='Vuori Tuomas (hard coded)'
                    />
                    <TextContainer
                        label='PÄIVITYSPVM'
                        value='23.08.2017 (hard coded)'
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
export default RouteLinkView;
