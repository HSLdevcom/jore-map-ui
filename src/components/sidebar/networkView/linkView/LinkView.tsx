import React from 'react';
import Moment from 'moment';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import L from 'leaflet';
import ButtonType from '~/enums/buttonType';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import LinkService from '~/services/linkService';
import nodeTypeCodeList from '~/codeLists/nodeTypeCodeList';
import SubSites from '~/routing/subSites';
import directionCodeList from '~/codeLists/directionCodeList';
import routeBuilder from '~/routing/routeBuilder';
import municipalityCodeList from '~/codeLists/municipalityCodeList';
import navigator from '~/routing/navigator';
import { LinkStore } from '~/stores/linkStore';
import { MapStore } from '~/stores/mapStore';
import { ErrorStore } from '~/stores/errorStore';
import { Checkbox, Dropdown, Button, TransitToggleButtonBar } from '../../../controls';
import InputContainer from '../../InputContainer';
import MultiTabTextarea from './MultiTabTextarea';
import Loader from '../../../shared/loader/Loader';
import ViewHeader from '../../ViewHeader';
import * as s from './linkView.scss';

interface ILinkViewState {
    isLoading: boolean;
    isEditingDisabled: boolean;
    invalidFieldsMap: object;
}

interface ILinkViewProps {
    match?: match<any>;
    errorStore?: ErrorStore;
    linkStore?: LinkStore;
    mapStore?: MapStore;
}

@inject('linkStore', 'mapStore', 'errorStore')
@observer
class LinkView extends ViewFormBase<ILinkViewProps, ILinkViewState> {
    constructor(props: ILinkViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            isEditingDisabled: true,
            invalidFieldsMap: {},
        };
    }

    async componentDidMount() {
        this.setState({ isLoading: true });
        const [startNodeId, endNodeId, transitTypeCode] = this.props.match!.params.id.split(',');
        try {
            if (startNodeId && endNodeId && transitTypeCode) {
                const link = await LinkService.fetchLink(startNodeId, endNodeId, transitTypeCode);
                this.props.linkStore!.setLink(link);
                this.props.linkStore!.setNodes([link.startNode, link.endNode]);
                const bounds = L.latLngBounds(link.geometry);
                this.props.mapStore!.setMapBounds(bounds);
            }
        } catch (ex) {
            this.props.errorStore!.addError(
                // tslint:disable-next-line:max-line-length
                `Haku löytää linkki, jolla lnkalkusolmu ${startNodeId}, lnkloppusolmu ${endNodeId} ja lnkverkko ${transitTypeCode}, ei onnistunut.`,
            );
        }
        this.setState({ isLoading: false });
    }

    private onChange = () => {
    }

    private save = async () => {
        this.setState({ isLoading: true });
        this.setState({ isLoading: false });
    }

    private navigateToNode = (nodeId: string) => () => {
        const editNetworkLink = routeBuilder
            .to(SubSites.node)
            .toTarget(nodeId)
            .toLink();
        navigator.goTo(editNetworkLink);
    }

    componentWillUnmount() {
        this.props.linkStore!.clear();
    }

    private toggleIsEditingEnabled = () => {
        this.toggleIsEditingDisabled(
            () => {},
        );
    }

    render() {
        const link = this.props.linkStore!.link;
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.linkView, s.loaderContainer)}>
                    <Loader />
                </div>
            );
        }
        // TODO: show some indicator to user of an empty page
        if (!link) return null;

        // tslint:disable-next-line:max-line-length
        const closePromptMessage = 'Linkilla on tallentamattomia muutoksia. Oletko varma, että haluat poistua näkymästä? Tallentamattomat muutokset kumotaan.';

        const isEditingDisabled = this.state.isEditingDisabled;
        const startNode = link!.startNode;
        const endNode = link!.endNode;
        const datetimeStringDisplayFormat = 'YYYY-MM-DD HH:mm:ss';
        const isSaveButtonDisabled = this.state.isEditingDisabled
            || !this.props.linkStore!.isDirty;
            // || !this.isFormValid();

        return (
        <div className={s.linkView}>
            <div className={s.content}>
                <ViewHeader
                    closePromptMessage={
                        this.props.linkStore!.isDirty ? closePromptMessage : undefined
                    }
                    isEditButtonVisible={true}
                    isEditing={!isEditingDisabled}
                    onEditButtonClick={this.toggleIsEditingEnabled}
                >
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
                                disabled={true}
                                selected={startNode.type}
                                codeList={nodeTypeCodeList}
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
                                disabled={true}
                                selected={endNode.type}
                                codeList={nodeTypeCodeList}
                            />
                            <InputContainer
                                label='NIMI'
                                disabled={true}
                                value={endNode && endNode.stop ? endNode.stop!.nameFi : '-'}
                            />
                        </div>
                    </div>
                    <div className={s.flexRow}>
                        <div className={s.formItem}>
                            <div className={s.inputLabel}>
                                VERKKO
                            </div>
                            <TransitToggleButtonBar
                                selectedTransitTypes={[link!.transitType]}
                            />
                        </div>
                    </div>
                    <div className={s.flexRow}>
                        <Dropdown
                            label='SUUNTA'
                            disabled={isEditingDisabled}
                            selected={link.direction}
                            codeList={directionCodeList}
                        />
                        <InputContainer
                            label='OS. NRO'
                            disabled={isEditingDisabled}
                            value={link.osNumber}
                        />
                        <InputContainer
                            label='LINKIN PITUUS (m)'
                            disabled={isEditingDisabled}
                            value={link.length}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='KATU'
                            disabled={isEditingDisabled}
                            value={link.streetName}
                        />
                        <InputContainer
                            label='KATUOSAN OS. NRO'
                            disabled={isEditingDisabled}
                            value={link.streetNumber}
                        />
                        <Dropdown
                            onChange={this.onChange}
                            disabled={isEditingDisabled}
                            codeList={municipalityCodeList}
                            selected={link.municipalityCode}
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
                            value={link.modifiedBy}
                        />
                        <InputContainer
                            label='PÄIVITYSPVM'
                            value={Moment(link.modifiedOn)
                            .format(datetimeStringDisplayFormat)}
                        />
                    </div>
                </div>
                <MultiTabTextarea
                    tabs={['Tariffialueet', 'Määränpäät', 'Ajoajat']}
                />
                <div className={s.buttonBar}>
                    <Button
                        onClick={this.navigateToNode(link.startNode.id)}
                        type={ButtonType.ROUND}
                    >
                        Alkusolmu
                    </Button>
                    <Button
                        onClick={this.navigateToNode(link.endNode.id)}
                        type={ButtonType.ROUND}
                    >
                        Loppusolmu
                    </Button>
                </div>
            </div >
            <Button
                type={ButtonType.SAVE}
                disabled={isSaveButtonDisabled}
                onClick={this.save}
            >
                Tallenna muutokset
            </Button>
        </div >
        );
    }
}
export default LinkView;
