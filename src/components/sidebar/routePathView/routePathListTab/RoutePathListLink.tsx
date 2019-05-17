import React from 'react';
import { observer, inject } from 'mobx-react';
import { FiChevronRight } from 'react-icons/fi';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import classnames from 'classnames';
import { IRoutePathLink } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import { CodeListStore } from '~/stores/codeListStore';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import RoutePathListItem from './RoutePathListItem';
import TextContainer from '../../../controls/TextContainer';
import * as s from './routePathListItem.scss';

interface IRoutePathListLinkProps {
    routePathStore?: RoutePathStore;
    codeListStore?: CodeListStore;
    routePathLink: IRoutePathLink;
    reference: React.RefObject<HTMLDivElement>;
}

@inject('routePathStore', 'codeListStore')
@observer
class RoutePathListLink extends React.Component<IRoutePathListLinkProps> {
    private renderHeader = () => {
        const id = this.props.routePathLink.id;
        const orderNumber = this.props.routePathLink.orderNumber;
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
                        Reitinlinkki {orderNumber}
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
        return (
            <div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='ALKUSOLMU'
                        value={rpLink.startNode.id}
                        darkerInputLabel={true}
                    />
                    <TextContainer
                        label='LOPPUSOLMU'
                        value={rpLink.endNode.id}
                        darkerInputLabel={true}
                    />
                </div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='JÄRJESTYSNUMERO'
                        value={rpLink.orderNumber.toString()}
                        darkerInputLabel={true}
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
