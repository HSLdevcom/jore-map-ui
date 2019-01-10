import * as React from 'react';
import NodeType from '~/enums/nodeType';
import NodeTypeDescription from '~/enums/l10n/nodeTypeDescription';
import { IRoutePathLink, INode } from '~/models';
import * as s from './routePathListObject.scss';
import RoutePathListObject from './RoutePathListObject';

interface IRoutePathListNodeProps {
    node: INode;
    routePathLink: IRoutePathLink;
}

interface IRoutePathListNodeState {
    isExtended: boolean;
}

class RoutePathListNode
    extends React.Component<IRoutePathListNodeProps, IRoutePathListNodeState> {

    private renderNodeDescription = (routePathLink: IRoutePathLink, nodeType?: string) => {
        return (
            <>
                {this.renderNodeTypeDescription(nodeType)}
                {this.renderTimeAlignmentDescription(routePathLink)}
            </>
        );
    }

    private renderNodeTypeDescription = (nodeType?: string) => {
        let className;
        let description;
        switch (nodeType) {
        case NodeType.STOP: {
            description = NodeTypeDescription.STOP;
            break;
        }
        case NodeType.CROSSROAD: {
            description = NodeTypeDescription.CROSSROAD;
            break;
        }
        case NodeType.DISABLED: {
            className = s.notInUse;
            description = NodeTypeDescription.DISABLED;
            break;
        }
        case NodeType.MUNICIPALITY_BORDER: {
            description = NodeTypeDescription.MUNICIPALITY_BORDER;
            break;
        }
        default: {
            throw new Error(`Node type not supported: ${nodeType}`);
        }}
        return (
            <div className={s.type}>
                Tyyppi: <span className={className}>{description}</span>
            </div>
        );
    }

    private renderTimeAlignmentDescription = (routePathLink: IRoutePathLink) => {
        if (!routePathLink.isStartNodeTimeAlignmentStop) return null;
        return (
            <div className={s.description}>
                {NodeTypeDescription.TIME_ALIGNMENT_STOP}
            </div>
        );
    }

    render() {
        return (
            <RoutePathListObject
                headerLabel='Solmu'
                id={this.props.node.id}
                description={this.renderNodeDescription(
                    this.props.routePathLink,
                    this.props.node.type,
                )}
            >
                <div>Solmun lisätiedot</div>
            </RoutePathListObject>
        );
    }
}

export default RoutePathListNode;
