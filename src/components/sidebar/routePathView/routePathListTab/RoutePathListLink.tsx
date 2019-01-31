import React from 'react';
import { observer, inject } from 'mobx-react';
import { FiChevronRight } from 'react-icons/fi';
import { IRoutePathLink } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import TransitTypeHelper from '~/util/transitTypeHelper';
import RoutePathListObject, { ListObjectType } from './RoutePathListObject';
import InputContainer from '../../InputContainer';
import * as s from './routePathListObject.scss';

interface IRoutePathListLinkProps {
    routePathStore?: RoutePathStore;
    routePathLink: IRoutePathLink;
    reference: React.RefObject<HTMLDivElement>;
}

@inject('routePathStore')
@observer
class RoutePathListLink extends React.Component<IRoutePathListLinkProps> {
    private renderNodeHeaderIcon = () => <div className={s.linkIcon} />;

    private renderRoutePathLinkView = (rpLink: IRoutePathLink) => {
        return (
            <div className={s.nodeContent}>
                Reitinlinkin tiedot
                <div className={s.flexRow}>
                    <InputContainer
                        label='ALKUSOLMU'
                        disabled={true}
                        value={rpLink.startNode.id}
                    />
                    <InputContainer
                        label='LOPPUSOLMU'
                        disabled={true}
                        value={rpLink.endNode.id}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='JÄRJESTYSNUMERO'
                        disabled={true}
                        value={rpLink.orderNumber.toString()}
                    />
                    <InputContainer
                        label='AJANTASAUSPYSÄKKI'
                        disabled={true}
                        value={rpLink.isStartNodeTimeAlignmentStop ? 'Kyllä' : 'ei'}
                    />
                </div>
            </div>
        );
    }

    private openInNetworkView = () => {
        const routeLink = this.props.routePathLink;
        const routeLinkViewLink = routeBuilder
            .to(subSites.link)
            .toTarget([
                routeLink.startNode.id,
                routeLink.endNode.id,
                TransitTypeHelper.convertTransitTypeToTransitTypeCode(
                    routeLink.transitType,
                ),
            ].join(','))
            .toLink();
        navigator.goTo(routeLinkViewLink);
    }

    render() {
        return (
            <RoutePathListObject
                reference={this.props.reference}
                objectType={ListObjectType.Link}
                headerIcon={this.renderNodeHeaderIcon()}
                headerTypeName='Reitinlinkki'
                headerContent={''}
                id={this.props.routePathLink.id}
            >
                <div className={s.extendedContent}>
                    {
                        this.renderRoutePathLinkView(this.props.routePathLink)
                    }
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
            </RoutePathListObject>
        );
    }
}

export default RoutePathListLink;
