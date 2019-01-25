import React from 'react';
import NodeType from '~/enums/nodeType';
import classnames from 'classnames';
import NodeTypeDescription from '~/enums/l10n/nodeTypeDescription';
import { IRoutePathLink, INode, IStop } from '~/models';
import { FiChevronRight } from 'react-icons/fi';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import InputContainer from '../../InputContainer';
import RoutePathListObject, { ListObjectType } from './RoutePathListObject';
import * as s from './routePathListObject.scss';

interface IRoutePathListNodeProps {
    node: INode;
    reference: React.RefObject<HTMLDivElement>;
    routePathLink: IRoutePathLink;
}

interface IRoutePathListNodeState {
    isExtended: boolean;
}

class RoutePathListNode extends React.Component<IRoutePathListNodeProps, IRoutePathListNodeState> {

    private getNodeTypeName = (nodeType?: NodeType) => {
        if (!nodeType) {
            return 'Tyhjä';
        }
        switch (nodeType) {
        case NodeType.STOP: {
            return NodeTypeDescription.STOP.toString();
        }
        case NodeType.CROSSROAD: {
            return NodeTypeDescription.CROSSROAD.toString();
        }
        case NodeType.DISABLED: {
            return NodeTypeDescription.DISABLED.toString();
        }
        case NodeType.MUNICIPALITY_BORDER: {
            return NodeTypeDescription.MUNICIPALITY_BORDER.toString();
        }
        default: {
            return nodeType.toString();
        }}
    }

    private addBorder = (icon: React.ReactNode, color: string) => {
        return (
            <div className={s.iconBorder} style={{ borderColor: color }}>
                {icon}
            </div>
        );
    }

    private renderNodeHeaderIcon = (node: INode, routePathLink: IRoutePathLink) => {
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

    private openInNetworkView = () => {
        const editNetworkLink = routeBuilder
            .to(SubSites.networkNode)
            .toTarget(this.props.node.id)
            .toLink();
        navigator.goTo(editNetworkLink);
    }

    private renderStopView = (stop: IStop) => {
        return (
            <div className={s.stopContent}>
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

    private renderNodeHeaderContent = (node: INode) => {
        return (
            <div className={s.headerContentDescription}>
                {node.shortId ? node.shortId : '-'}
                <span>
                    ({node.id})
                </span>
            </div>
        );
    }

    render() {
        return (
            <RoutePathListObject
                reference={this.props.reference}
                objectType={ListObjectType.Node}
                headerContent={this.renderNodeHeaderContent(this.props.node)}
                headerIcon={this.renderNodeHeaderIcon(this.props.node, this.props.routePathLink)}
                headerTypeName={this.getNodeTypeName(this.props.node.type)}
                id={this.props.node.id}
            >
                <div className={s.extendedContent}>
                    <div className={s.header}>
                        {this.getNodeTypeName(this.props.node.type)}
                    </div>
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
            </RoutePathListObject>
        );
    }
}

export default RoutePathListNode;
