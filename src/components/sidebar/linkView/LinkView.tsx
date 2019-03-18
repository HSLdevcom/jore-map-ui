import React from 'react';
import Moment from 'moment';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { RouteComponentProps } from 'react-router-dom';
import L from 'leaflet';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import ButtonType from '~/enums/buttonType';
import { IValidationResult } from '~/validation/FormValidator';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import Loader from '~/components/shared/loader/Loader';
import LinkService from '~/services/linkService';
import nodeTypeCodeList from '~/codeLists/nodeTypeCodeList';
import linkValidationModel from '~/validation/models/linkValidationModel';
import SubSites from '~/routing/subSites';
import directionCodeList from '~/codeLists/directionCodeList';
import { DialogStore } from '~/stores/dialogStore';
import routeBuilder from '~/routing/routeBuilder';
import municipalityCodeList from '~/codeLists/municipalityCodeList';
import navigator from '~/routing/navigator';
import { LinkStore } from '~/stores/linkStore';
import { MapStore } from '~/stores/mapStore';
import { ErrorStore } from '~/stores/errorStore';
import { Dropdown, Button, TransitToggleButtonBar } from '../../controls';
import InputContainer from '../InputContainer';
import TextContainer from '../TextContainer';
import SidebarHeader from '../SidebarHeader';
import * as s from './linkView.scss';

interface ILinkViewState {
    isLoading: boolean;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
}

interface ILinkViewProps extends RouteComponentProps<any> {
    errorStore?: ErrorStore;
    linkStore?: LinkStore;
    mapStore?: MapStore;
    dialogStore?: DialogStore;
}

@inject('linkStore', 'mapStore', 'errorStore', 'dialogStore')
@observer
class LinkView extends ViewFormBase<ILinkViewProps, ILinkViewState> {
    constructor(props: ILinkViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            isEditingDisabled: true,
            invalidPropertiesMap: {},
        };
    }

    async componentDidMount() {
        await this.initUsingUrlParams();
        if (this.props.linkStore!.link) {
            const bounds = L.latLngBounds(this.props.linkStore!.link!.geometry);
            this.props.mapStore!.setMapBounds(bounds);
        }
    }

    componentDidUpdate(prevProps: ILinkViewProps) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.initUsingUrlParams();
        }
    }

    componentWillUnmount() {
        this.props.linkStore!.clear();
    }

    private initUsingUrlParams = async () => {
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

    private onChange = (property: string) =>
        (value: any, validationResult?: IValidationResult) => {
            this.props.linkStore!.updateLinkProperty(property, value);
            if (validationResult) {
                this.markInvalidProperties(property, validationResult!.isValid);
            }
        }

    private save = async () => {
        this.setState({ isLoading: true });
        try {
            await LinkService.updateLink(this.props.linkStore!.link);

            this.props.linkStore!.setOldLink(this.props.linkStore!.link);
            this.props.dialogStore!.setFadeMessage('Tallennettu!');
        } catch (err) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, err);
        }
        this.setState({ isLoading: false });
    }

    private navigateToNode = (nodeId: string) => () => {
        const editNetworkLink = routeBuilder
            .to(SubSites.node)
            .toTarget(nodeId)
            .toLink();
        navigator.goTo(editNetworkLink);
    }

    private toggleIsEditingEnabled = () => {
        this.toggleIsEditingDisabled(
            this.props.linkStore!.undoChanges,
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

        const isEditingDisabled = this.state.isEditingDisabled;
        const startNode = link!.startNode;
        const endNode = link!.endNode;
        const datetimeStringDisplayFormat = 'YYYY-MM-DD HH:mm:ss';
        const isSaveButtonDisabled = this.state.isEditingDisabled
            || !this.props.linkStore!.isDirty
            || !this.isFormValid();

        return (
        <div className={s.linkView}>
            <div className={s.content}>
                <SidebarHeader
                    isEditButtonVisible={true}
                    isEditing={!isEditingDisabled}
                    shouldShowClosePromptMessage={this.props.linkStore!.isDirty!}
                    onEditButtonClick={this.toggleIsEditingEnabled}
                >
                    Linkki
                </SidebarHeader>
                <div className={s.formSection}>
                    <div className={s.flexRow}>
                        <div className={s.formItem}>
                            <div className={s.inputLabel}>
                                VERKKO
                            </div>
                            <TransitToggleButtonBar
                                selectedTransitTypes={[link!.transitType]}
                                disabled={true}
                            />
                        </div>
                    </div>
                    <div className={s.flexRow}>
                        <TextContainer
                            label='ALKUSOLMU'
                            value={startNode ? startNode.id : '-'}
                        />
                        <TextContainer
                            label='TYYPPI'
                            value={nodeTypeCodeList[startNode.type]}
                        />
                        <TextContainer
                            label='NIMI'
                            value={
                                startNode && startNode.stop ? startNode.stop!.nameFi : '-'}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <TextContainer
                            label='LOPPUSOLMU'
                            value={endNode ? endNode.id : '-'}
                        />
                        <TextContainer
                            label='TYYPPI'
                            value={nodeTypeCodeList[endNode.type]}
                        />
                        <TextContainer
                            label='NIMI'
                            value={endNode && endNode.stop ? endNode.stop!.nameFi : '-'}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <Dropdown
                            label='SUUNTA'
                            disabled={isEditingDisabled}
                            selected={link.direction}
                            onChange={this.onChange('direction')}
                            codeList={directionCodeList}
                        />
                        <InputContainer
                            label='OS. NRO'
                            disabled={isEditingDisabled}
                            value={link.osNumber}
                            type='number'
                            onChange={this.onChange('osNumber')}
                            validatorRule={linkValidationModel.osNumber}
                        />
                        <InputContainer
                            label='LINKIN PITUUS (m)'
                            disabled={isEditingDisabled}
                            value={link.length}
                            type='number'
                            onChange={this.onChange('length')}
                            validatorRule={linkValidationModel.length}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            label='KATU'
                            disabled={isEditingDisabled}
                            value={link.streetName}
                            onChange={this.onChange('streetName')}
                        />
                        <InputContainer
                            label='KATUOSAN OS. NRO'
                            disabled={isEditingDisabled}
                            value={link.streetNumber}
                            type='number'
                            onChange={this.onChange('streetNumber')}
                            validatorRule={linkValidationModel.streetNumber}
                        />
                        <Dropdown
                            onChange={this.onChange('municipalityCode')}
                            disabled={isEditingDisabled}
                            codeList={municipalityCodeList}
                            selected={link.municipalityCode}
                            label='KUNTA'
                        />
                    </div>
                    <div className={s.flexRow}>
                        <TextContainer
                            label='PÄIVITTÄJÄ'
                            value={link.modifiedBy}
                        />
                        <TextContainer
                            label='PÄIVITYSPVM'
                            value={Moment(link.modifiedOn)
                                .format(datetimeStringDisplayFormat)}
                        />
                    </div>
                </div>

            </div >
            <div className={s.buttonBar}>
                <Button
                    onClick={this.navigateToNode(link.startNode.id)}
                    type={ButtonType.SQUARE}
                >
                    <div className={s.buttonContent}>
                        <FiChevronLeft
                            className={s.startNodeButton}
                        />
                        <div className={s.contentText}>
                            Alkusolmu
                            <p>
                                {startNode.id}
                            </p>
                        </div>
                    </div>
                </Button>
                <Button
                    onClick={this.navigateToNode(link.endNode.id)}
                    type={ButtonType.SQUARE}
                >
                    <div className={s.buttonContent}>
                        <div className={s.contentText}>
                            Loppusolmu
                            <p>
                                {endNode.id}
                            </p>
                        </div>
                        <FiChevronRight
                            className={s.endNodeButton}
                        />
                    </div>
                </Button>
            </div>
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
