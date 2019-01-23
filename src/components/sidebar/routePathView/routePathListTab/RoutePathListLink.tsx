import React from 'react';
import { observer, inject } from 'mobx-react';
import { FiChevronRight } from 'react-icons/fi';
import { IRoutePathLink, INode } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import RoutePathListObject, { ListObjectType } from './RoutePathListObject';
import InputContainer from '../../InputContainer';
import * as s from './routePathListObject.scss';

interface IRoutePathListLinkProps {
    routePathStore?: RoutePathStore;
    previousNode?: INode;
    routePathLink: IRoutePathLink;
    nextNode?: INode;
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
    }

    render() {
        return (
            <RoutePathListObject
                objectType={ListObjectType.Link}
                id={this.props.routePathLink.id}
                headerIcon={this.renderNodeHeaderIcon()}
                headerTypeName='Reitinlinkki'
            >
                <div className={s.extendedContent}>
                    <div className={s.header}>
                        Reitinlinkki
                    </div>
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
