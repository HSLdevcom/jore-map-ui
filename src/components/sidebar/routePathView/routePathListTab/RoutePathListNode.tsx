import * as React from 'react';
import NodeType from '~/enums/nodeType';
import classnames from 'classnames';
import NodeTypeDescription from '~/enums/l10n/nodeTypeDescription';
import { IRoutePathLink, INode } from '~/models';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import RoutePathListObject, { ListObjectType } from './RoutePathListObject';
import * as s from './routePathListObject.scss';
import * as nS from './routePathListNode.scss';

interface IRoutePathListNodeProps {
    node: INode;
    routePathLink: IRoutePathLink;
}

interface IRoutePathListNodeState {
    isExtended: boolean;
}

class RoutePathListNode
    extends React.Component<IRoutePathListNodeProps, IRoutePathListNodeState> {

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
            icon = this.addBorder(icon, '#c900ff');
        } else if (node.type === NodeType.STOP) {
            node.transitTypes.forEach((type) => {
                icon = this.addBorder(icon, TransitTypeColorHelper.getColor(type));
            });
        } else if (node.type === NodeType.CROSSROAD) {
            icon = this.addBorder(icon, '#727272');
        }

        return icon;
    }

    render() {
        return (
            <RoutePathListObject
                id={this.props.node.id}
                headerIcon={this.renderNodeHeaderIcon(this.props.node, this.props.routePathLink)}
                objectType={ListObjectType.Node}
                headerTypeName={this.getNodeTypeName(this.props.node.type)}
            >
                <div className={classnames(nS.routePathListNode)}>
                    no content
                </div>
            </RoutePathListObject>
        );
    }
}

export default RoutePathListNode;
