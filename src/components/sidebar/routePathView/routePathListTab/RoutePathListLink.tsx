import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import IRoutePathLink from '~/models/IRoutePathLink';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { CodeListStore } from '~/stores/codeListStore';
import { RoutePathStore } from '~/stores/routePathStore';
import TextContainer from '../../../controls/TextContainer';
import RoutePathListItem from './RoutePathListItem';
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
                className={classnames(s.itemHeader, isExtended ? s.itemExtended : null)}
                data-cy='itemHeader'
            >
                <div className={s.headerSubtopicContainer}>Reitinlinkki {orderNumber}</div>
                <div className={s.headerContent} />
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
                    <Button onClick={() => this.openLinkInNewTab()} type={ButtonType.SQUARE}>
                        Avaa linkki verkkonäkymässä
                        <FiExternalLink />
                    </Button>
                </div>
            </div>
        );
    };

    private openLinkInNewTab = () => {
        const routeLink = this.props.routePathLink;
        const linkViewLink = routeBuilder
            .to(SubSites.link)
            .toTarget(
                ':id',
                [routeLink.startNode.id, routeLink.endNode.id, routeLink.transitType].join(',')
            )
            .toLink();
        window.open(linkViewLink, '_blank');
    };

    private renderRoutePathLinkView = (rpLink: IRoutePathLink) => {
        return (
            <div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='ALKUSOLMU'
                        value={rpLink.startNode.id}
                        isInputLabelDarker={true}
                    />
                    <TextContainer
                        label='LOPPUSOLMU'
                        value={rpLink.endNode.id}
                        isInputLabelDarker={true}
                    />
                </div>
                <div className={s.flexRow}>
                    <TextContainer
                        label='JÄRJESTYSNUMERO'
                        value={rpLink.orderNumber.toString()}
                        isInputLabelDarker={true}
                    />
                </div>
            </div>
        );
    };

    private renderListIcon = () => <div className={s.linkIcon} />;

    render() {
        const geometry = this.props.routePathStore!.getLinkGeom(this.props.routePathLink.id);
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
