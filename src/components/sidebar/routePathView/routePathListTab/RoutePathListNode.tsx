import React from 'react';
import NodeType from '~/enums/nodeType';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { IRoutePathLink, INode, IStop } from '~/models';
import { FiChevronRight } from 'react-icons/fi';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { RoutePathStore } from '~/stores/routePathStore';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import NodeTypeHelper from '~/util/nodeTypeHelper';
import navigator from '~/routing/navigator';
import InputContainer from '../../InputContainer';
import RoutePathListObject from './RoutePathListObject';
import * as s from './routePathListObject.scss';

interface IRoutePathListNodeProps {
    routePathStore?: RoutePathStore;
    node: INode;
    reference: React.RefObject<HTMLDivElement>;
    routePathLink: IRoutePathLink;
}

@inject('routePathStore')
@observer
class RoutePathListNode extends React.Component<IRoutePathListNodeProps> {
    private renderHeader = () => {
        const id = this.props.node.id;
        const isExtended = this.props.routePathStore!.isObjectExtended(
            id,
        );
        return (
            <div
                className={
                    classnames(
                        s.itemHeader,
                        isExtended ? s.itemExtended : null,
                    )
                }
            >
                <div className={s.headerContent}>
                    <div className={s.headerIconContainer}>
                        {NodeTypeHelper.getNodeTypeName(this.props.node.type)}
                    </div>
                    <div className={s.label}>
                        {this.renderNodeHeaderContent()}
                    </div>
                </div>
                <div className={s.itemToggle}>
                    {isExtended && <FaAngleDown />}
                    {!isExtended && <FaAngleRight />}
                </div>
            </div>
        );
    }

    private renderNodeHeaderContent = () => {
        const node = this.props.node;
        return (
            <div className={s.headerContentDescription}>
                <div>
                    {node.shortId ? node.shortId : '?'}
                </div>
                <span>
                    {node.id}
                </span>
            </div>
        );
    }

    private renderBody = () => {
        return (
            <div className={s.extendedContent}>
                { Boolean(this.props.node.stop) &&
                    this.renderStopView(this.props.node.stop!)
                }
                {
                    this.renderNodeView(this.props.node)
                }
                <div className={s.footer}>
                    <Button
                        onClick={this.openInNetworkView}
                        type={ButtonType.SQUARE}
                    >
                        Avaa solmu verkkonäkymässä
                        <FiChevronRight />
                    </Button>
                </div>
            </div>
        );
    }

    private openInNetworkView = () => {
        const editNetworkLink = routeBuilder
            .to(SubSites.node)
            .toTarget(this.props.node.id)
            .toLink();
        navigator.goTo(editNetworkLink);
    }

    private renderStopView = (stop: IStop) => {
        return (
            <div className={s.stopContent}>
                Pysäkin tiedot
                <div className={s.flexRow}>
                    <InputContainer
                        label='PYSÄKIN NIMI'
                        disabled={true}
                        value={stop.nameFi}
                    />
                    <InputContainer
                        label='PYSÄKIN NIMI RUOTSIKSI'
                        disabled={true}
                        value={stop.nameSe}
                    />
                </div>
            </div>
        );
    }

    private renderNodeView = (node: INode) => {
        return (
            <div className={s.nodeContent}>
                Solmun tiedot
                <div className={s.flexRow}>
                    <InputContainer
                        label='MITTAUSPÄIVÄMÄÄRÄ'
                        disabled={true}
                        value={node.measurementDate}
                    />
                    <InputContainer
                        label='SOLMUN TYYPPI'
                        disabled={true}
                        value={node.type}
                    />
                </div>
            </div>
        );
    }

    private renderListIcon = () => {
        const node = this.props.node;
        const routePathLink = this.props.routePathLink;
        let icon = (
            <div
                className={
                    classnames(
                        s.nodeIcon,
                        routePathLink.isStartNodeTimeAlignmentStop
                            ? s.timeAlignmentIcon
                            : undefined)
                    }
            />
        );

        if (node.type === NodeType.MUNICIPALITY_BORDER) {
            icon = this.addBorder(icon, '#c900ff');
        } else if (node.type === NodeType.DISABLED) {
            icon = this.addBorder(icon, '#353333');
        } else if (node.type === NodeType.STOP) {
            node.transitTypes.forEach((type) => {
                icon = this.addBorder(icon, TransitTypeColorHelper.getColor(type));
            });
        } else if (node.type === NodeType.CROSSROAD) {
            icon = this.addBorder(icon, '#727272');
        }

        return icon;
    }

    private addBorder = (icon: React.ReactNode, color: string) => {
        return (
            <div className={s.iconBorder} style={{ borderColor: color }}>
                {icon}
            </div>
        );
    }

    render() {
        return (
            <RoutePathListObject
                reference={this.props.reference}
                id={this.props.node.id}
                getGeometry={this.props.routePathStore!.getNodeGeom}
                hasShadow={true}
                header={this.renderHeader()}
                body={this.renderBody()}
                listIcon={this.renderListIcon()}
            />
        );
    }
}

export default RoutePathListNode;
