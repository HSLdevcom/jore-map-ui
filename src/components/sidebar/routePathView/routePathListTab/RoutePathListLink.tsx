import React from 'react';
import { observer, inject } from 'mobx-react';
import { FiChevronRight } from 'react-icons/fi';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import classnames from 'classnames';
import { IRoutePathLink } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import { CodeListStore } from '~/stores/codeListStore';
import { Button, Checkbox } from '~/components/controls';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import ButtonType from '~/enums/buttonType';
import routePathLinkValidationModel from '~/models/validationModels/routePathLinkValidationModel';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import RoutePathListItem from './RoutePathListItem';
import InputContainer from '../../InputContainer';
import TextContainer from '../../TextContainer';
import * as s from './routePathListItem.scss';

interface IRoutePathListLinkProps {
    routePathStore?: RoutePathStore;
    codeListStore?: CodeListStore;
    routePathLink: IRoutePathLink;
    reference: React.RefObject<HTMLDivElement>;
    isEditingDisabled: boolean;
}

interface IRoutePathListLinkState {
    isLoading: boolean; // not currently in use, declared because ViewFormBase needs this
    invalidPropertiesMap: object;
    isEditingDisabled: boolean; // not currently in use, declared because ViewFormBase needs this
}

@inject('routePathStore', 'codeListStore')
@observer
class RoutePathListLink extends ViewFormBase<
    IRoutePathListLinkProps,
    IRoutePathListLinkState
> {
    constructor(props: IRoutePathListLinkProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {},
            isEditingDisabled: false
        };
    }

    componentDidMount() {
        this.validateLink();
    }

    componentDidUpdate(prevProps: IRoutePathListLinkProps) {
        if (
            prevProps.isEditingDisabled !== this.props.isEditingDisabled &&
            !this.props.isEditingDisabled
        ) {
            this.validateLink();
        }
    }

    private validateLink = () => {
        this.validateAllProperties(
            routePathLinkValidationModel,
            this.props.routePathLink
        );
        const isLinkFormValid = this.isFormValid();
        const orderNumber = this.props.routePathLink.orderNumber;
        this.props.routePathStore!.setLinkFormValidity(
            orderNumber,
            isLinkFormValid
        );
    };

    private onCheckboxChange = (property: string, value: boolean) => () => {
        const orderNumber = this.props.routePathLink.orderNumber;
        this.props.routePathStore!.updateRoutePathLinkProperty(
            orderNumber,
            property,
            !value
        );
    };

    private onRoutePathLinkPropertyChange = (property: string) => (
        value: any
    ) => {
        const _value = value === '' ? null : value;
        const orderNumber = this.props.routePathLink.orderNumber;
        this.props.routePathStore!.updateRoutePathLinkProperty(
            orderNumber,
            property,
            _value
        );
        this.validateProperty(
            routePathLinkValidationModel[property],
            property,
            _value
        );
        const isLinkFormValid = this.isFormValid();
        this.props.routePathStore!.setLinkFormValidity(
            orderNumber,
            isLinkFormValid
        );
    };

    private renderHeader = () => {
        const id = this.props.routePathLink.id;
        const isExtended = this.props.routePathStore!.isListItemExtended(id);
        return (
            <div
                className={classnames(
                    s.itemHeader,
                    isExtended ? s.itemExtended : null
                )}
            >
                <div className={s.headerContent}>
                    <div className={s.headerNodeTypeContainer}>
                        Reitinlinkki
                    </div>
                    <div className={s.label} />
                </div>
                <div className={s.itemToggle}>
                    {isExtended && <FaAngleDown />}
                    {!isExtended && <FaAngleRight />}
                </div>
            </div>
        );
    };

    private renderBody = () => {
        return (
            <div className={s.extendedContent}>
                {this.renderRoutePathLinkView(this.props.routePathLink)}
                <div className={s.footer}>
                    <Button
                        onClick={this.openInNetworkView}
                        type={ButtonType.SQUARE}
                    >
                        Avaa linkki verkkonäkymässä
                        <FiChevronRight />
                    </Button>
                </div>
            </div>
        );
    };

    private renderRoutePathLinkView = (rpLink: IRoutePathLink) => {
        const isEditingDisabled = this.props.isEditingDisabled;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        const routePathLink = this.props.routePathLink;
        return (
            <div className={s.nodeContent}>
                Reitinlinkin tiedot
                <div className={s.flexRow}>
                    <TextContainer
                        label='ALKUSOLMU'
                        value={rpLink.startNode.id}
                    />
                    <TextContainer
                        label='LOPPUSOLMU'
                        value={rpLink.endNode.id}
                    />
                </div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='JÄRJESTYSNUMERO'
                        value={rpLink.orderNumber.toString()}
                    />
                </div>
                <div className={s.flexRow}>
                    <Checkbox
                        disabled={isEditingDisabled}
                        checked={routePathLink.isAtBookSchedule}
                        content='Laitetaanko ohitusaika kirja-aikatauluun?'
                        onClick={this.onCheckboxChange(
                            'isAtBookSchedule',
                            routePathLink.isAtBookSchedule
                        )}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={isEditingDisabled}
                        type={'number'}
                        label='ALKUSOLMUN SARAKENUMERO KIRJA-AIKATAULUSSA'
                        onChange={this.onRoutePathLinkPropertyChange(
                            'startNodeColumnNumber'
                        )}
                        value={routePathLink.startNodeColumnNumber}
                        validationResult={
                            invalidPropertiesMap['startNodeColumnNumber']
                        }
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        disabled={true}
                        label='MUOKANNUT'
                        value={'-'}
                    />
                    <InputContainer
                        disabled={true}
                        label='MUOKATTU PVM'
                        value={'-'}
                    />
                </div>
            </div>
        );
    };

    private openInNetworkView = () => {
        const routeLink = this.props.routePathLink;
        const routeLinkViewLink = routeBuilder
            .to(SubSites.link)
            .toTarget(
                [
                    routeLink.startNode.id,
                    routeLink.endNode.id,
                    routeLink.transitType
                ].join(',')
            )
            .toLink();
        navigator.goTo(routeLinkViewLink);
    };

    private renderListIcon = () => <div className={s.linkIcon} />;

    render() {
        const geometry = this.props.routePathStore!.getLinkGeom(
            this.props.routePathLink.id
        );
        return (
            <RoutePathListItem
                reference={this.props.reference}
                id={this.props.routePathLink.id}
                geometry={geometry}
                header={this.renderHeader()}
                body={this.renderBody()}
                listIcon={this.renderListIcon()}
            />
        );
    }
}

export default RoutePathListLink;
