import React from 'react';
import Moment from 'moment';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { RouteComponentProps } from 'react-router-dom';
import L from 'leaflet';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import Loader from '~/components/shared/loader/Loader';
import LinkService from '~/services/linkService';
import NodeService from '~/services/nodeService';
import { INode } from '~/models';
import SubSites from '~/routing/subSites';
import { CodeListStore } from '~/stores/codeListStore';
import linkValidationModel from '~/models/validationModels/linkValidationModel';
import { AlertStore } from '~/stores/alertStore';
import routeBuilder from '~/routing/routeBuilder';
import LinkFactory from '~/factories/linkFactory';
import navigator from '~/routing/navigator';
import { LinkStore } from '~/stores/linkStore';
import { MapStore } from '~/stores/mapStore';
import { ErrorStore } from '~/stores/errorStore';
import { Dropdown, Button, TransitToggleButtonBar } from '../../controls';
import InputContainer from '../../controls/InputContainer';
import TextContainer from '../../controls/TextContainer';
import SidebarHeader from '../SidebarHeader';
import * as s from './linkView.scss';

interface ILinkViewState {
    isLoading: boolean;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
}

interface ILinkViewProps extends RouteComponentProps<any> {
    isNewLink: boolean;
    codeListStore?: CodeListStore;
    errorStore?: ErrorStore;
    linkStore?: LinkStore;
    mapStore?: MapStore;
    alertStore?: AlertStore;
}

interface ILinkViewState {
    isLoading: boolean;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
}

@inject('linkStore', 'mapStore', 'errorStore', 'alertStore', 'codeListStore')
@observer
class LinkView extends ViewFormBase<ILinkViewProps, ILinkViewState> {
    private existingTransitTypes: TransitType[] = [];

    constructor(props: ILinkViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            isEditingDisabled: !props.isNewLink,
            invalidPropertiesMap: {}
        };
    }

    async componentDidMount() {
        super.componentDidMount();
        if (this.props.isNewLink) {
            await this.initNewLink();
        } else {
            await this.initExistingLink();
        }

        if (this.props.linkStore!.link) {
            const bounds = L.latLngBounds(this.props.linkStore!.link!.geometry);
            this.props.mapStore!.setMapBounds(bounds);
            this.validateLink();
        }
    }

    componentDidUpdate(prevProps: ILinkViewProps) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            if (this.props.isNewLink) {
                this.initNewLink();
            } else {
                this.initExistingLink();
            }
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.props.linkStore!.clear();
    }

    private initExistingLink = async () => {
        this.setState({ isLoading: true });
        this.props.linkStore!.clear();

        const [
            startNodeId,
            endNodeId,
            transitTypeCode
        ] = this.props.match!.params.id.split(',');
        try {
            if (startNodeId && endNodeId && transitTypeCode) {
                const link = await LinkService.fetchLink(
                    startNodeId,
                    endNodeId,
                    transitTypeCode
                );
                this.props.linkStore!.init(link, [
                    link.startNode,
                    link.endNode
                ]);
                this.props.linkStore!.setIsLinkGeometryEditable(true);
                const bounds = L.latLngBounds(link.geometry);
                this.props.mapStore!.setMapBounds(bounds);
            }
        } catch (e) {
            this.props.errorStore!.addError(
                `Haku löytää linkki, jolla lnkalkusolmu ${startNodeId}, lnkloppusolmu ${endNodeId} ja lnkverkko ${transitTypeCode}, ei onnistunut.`,
                e
            );
        }
        this.setState({ isLoading: false });
    };

    private initNewLink = async () => {
        this.setState({ isLoading: true });
        this.props.linkStore!.clear();

        const [startNodeId, endNodeId] = this.props.match!.params.id.split(',');
        try {
            const startNode = await NodeService.fetchNode(startNodeId);
            const endNode = await NodeService.fetchNode(endNodeId);
            this.createNewLink(startNode, endNode);
        } catch (ex) {
            this.props.errorStore!.addError(
                `Alkusolmun ${startNodeId} tai loppusolmun ${endNodeId} haku epäonnistui`
            );
            return;
        }

        const link = this.props.linkStore!.link;
        const existingLinks = await LinkService.fetchLinks(
            link.startNode.id,
            link.endNode.id
        );
        if (existingLinks.length > 0) {
            this.existingTransitTypes = existingLinks.map(
                link => link.transitType!
            );
        }
        this.validateLink();

        this.setState({ isLoading: false });
    };

    private createNewLink = (startNode: INode, endNode: INode) => {
        const link = LinkFactory.createNewLink(startNode, endNode);
        this.props.linkStore!.init(link, [startNode, endNode]);
    };

    private save = async () => {
        this.setState({ isLoading: true });
        let shouldNavigateToNewLink = false;
        try {
            if (this.props.isNewLink) {
                await LinkService.createLink(this.props.linkStore!.link);
                shouldNavigateToNewLink = true;
            } else {
                await LinkService.updateLink(this.props.linkStore!.link);
                this.props.linkStore!.setOldLink(this.props.linkStore!.link);
            }
            await this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }

        if (shouldNavigateToNewLink) {
            this.navigateToNewLink();
        } else {
            this.setState({ isLoading: false });
        }
    };

    private navigateToNewLink = () => {
        const link = this.props.linkStore!.link;
        const linkViewLink = routeBuilder
            .to(SubSites.link)
            .toTarget(
                [link.startNode.id, link.endNode.id, link.transitType].join(',')
            )
            .toLink();
        navigator.goTo(linkViewLink);
    };

    private navigateToNode = (nodeId: string) => () => {
        const editNetworkLink = routeBuilder
            .to(SubSites.node)
            .toTarget(nodeId)
            .toLink();
        navigator.goTo(editNetworkLink);
    };

    private toggleIsEditingEnabled = () => {
        const isEditingDisabled = this.state.isEditingDisabled;
        if (!isEditingDisabled) {
            this.props.linkStore!.undoChanges();
        }
        this.toggleIsEditingDisabled();
        if (!isEditingDisabled) this.validateLink();
    };

    private validateLink = () => {
        this.validateAllProperties(
            linkValidationModel,
            this.props.linkStore!.link
        );
    };

    private selectTransitType = (transitType: TransitType) => {
        this.props.linkStore!.updateLinkProperty('transitType', transitType);
        this.validateProperty(
            linkValidationModel['transitType'],
            'transitType',
            transitType
        );
    };

    private transitTypeAlreadyExists = (transitType: TransitType) => {
        if (!this.props.isNewLink) return false;

        return this.existingTransitTypes.includes(transitType);
    };

    private onChange = (property: string) => (value: any) => {
        this.props.linkStore!.updateLinkProperty(property, value);
        this.validateProperty(linkValidationModel[property], property, value);
    };

    render() {
        const link = this.props.linkStore!.link;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
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

        const transitType = this.props.linkStore!.link.transitType;

        const isSaveButtonDisabled =
            !transitType ||
            this.state.isEditingDisabled ||
            !this.props.linkStore!.isDirty ||
            (this.props.isNewLink &&
                this.transitTypeAlreadyExists(transitType)) ||
            !this.isFormValid();
        const selectedTransitTypes = link!.transitType
            ? [link!.transitType!]
            : [];

        let transitTypeError;
        if (!transitType) {
            transitTypeError = 'Verkon tyyppi täytyy valita.';
        } else if (transitType && this.transitTypeAlreadyExists(transitType)) {
            transitTypeError =
                'Linkki on jo olemassa (sama alkusolmu, loppusolmu ja verkko).';
        }

        return (
            <div className={s.linkView}>
                <div className={s.content}>
                    <SidebarHeader
                        isEditButtonVisible={!this.props.isNewLink}
                        isEditing={!isEditingDisabled}
                        shouldShowClosePromptMessage={
                            this.props.linkStore!.isDirty!
                        }
                        onEditButtonClick={this.toggleIsEditingEnabled}
                    >
                        Linkki
                    </SidebarHeader>
                    <div className={s.formSection}>
                        <div className={s.flexRow}>
                            <div className={s.formItem}>
                                <div className={s.inputLabel}>VERKKO</div>
                                <TransitToggleButtonBar
                                    selectedTransitTypes={selectedTransitTypes}
                                    toggleSelectedTransitType={
                                        this.selectTransitType
                                    }
                                    disabled={!this.props.isNewLink}
                                    errorMessage={transitTypeError}
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
                                value={this.props.codeListStore!.getCodeListLabel(
                                    'Solmutyyppi (P/E)',
                                    startNode.type
                                )}
                            />
                            <TextContainer
                                label='NIMI'
                                value={
                                    startNode && startNode.stop
                                        ? startNode.stop!.nameFi
                                        : '-'
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <TextContainer
                                label='LOPPUSOLMU'
                                value={endNode ? endNode.id : '-'}
                            />
                            <TextContainer
                                label='TYYPPI'
                                value={this.props.codeListStore!.getCodeListLabel(
                                    'Solmutyyppi (P/E)',
                                    endNode.type
                                )}
                            />
                            <TextContainer
                                label='NIMI'
                                value={
                                    endNode && endNode.stop
                                        ? endNode.stop!.nameFi
                                        : '-'
                                }
                            />
                        </div>
                        <div className={s.flexRow}>
                            <Dropdown
                                label='SUUNTA'
                                disabled={isEditingDisabled}
                                selected={link.direction}
                                onChange={this.onChange('direction')}
                                items={this.props.codeListStore!.getCodeList(
                                    'Suunta'
                                )}
                            />
                            <InputContainer
                                label='OS. NRO'
                                disabled={isEditingDisabled}
                                value={link.osNumber}
                                type='number'
                                validationResult={
                                    invalidPropertiesMap['osNumber']
                                }
                                onChange={this.onChange('osNumber')}
                            />
                            <InputContainer
                                label='LINKIN PITUUS (m)'
                                disabled={isEditingDisabled}
                                value={link.length}
                                type='number'
                                validationResult={
                                    invalidPropertiesMap['length']
                                }
                                onChange={this.onChange('length')}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='KATU'
                                disabled={isEditingDisabled}
                                value={link.streetName}
                                validationResult={
                                    invalidPropertiesMap['streetName']
                                }
                                onChange={this.onChange('streetName')}
                            />
                            <InputContainer
                                label='KATUOSAN OS. NRO'
                                disabled={isEditingDisabled}
                                value={link.streetNumber}
                                type='number'
                                validationResult={
                                    invalidPropertiesMap['streetNumber']
                                }
                                onChange={this.onChange('streetNumber')}
                            />
                            <Dropdown
                                onChange={this.onChange('municipalityCode')}
                                disabled={isEditingDisabled}
                                items={this.props.codeListStore!.getCodeList(
                                    'Kunta (ris/pys)'
                                )}
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
                                value={Moment(link.modifiedOn).format(
                                    datetimeStringDisplayFormat
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className={s.buttonBar}>
                    <Button
                        onClick={this.navigateToNode(link.startNode.id)}
                        type={ButtonType.SQUARE}
                    >
                        <div className={s.buttonContent}>
                            <FiChevronLeft className={s.startNodeButton} />
                            <div className={s.contentText}>
                                Alkusolmu
                                <p>{startNode.id}</p>
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
                                <p>{endNode.id}</p>
                            </div>
                            <FiChevronRight className={s.endNodeButton} />
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
            </div>
        );
    }
}
export default LinkView;
