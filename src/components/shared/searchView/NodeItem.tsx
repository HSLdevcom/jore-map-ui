import React from 'react';
import { IoMdLocate } from 'react-icons/io';
import INodeBase from '~/models/baseModels/INodeBase';
import routeBuilder from '~/routing/routeBuilder';
import NodeTypeHelper from '~/util/nodeTypeHelper';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import * as s from './nodeItem.scss';

interface INodeItemProps {
    node: INodeBase;
}

class NodeItem extends React.Component<INodeItemProps> {
    private openNode = () => {
        const nodeLink = routeBuilder
            .to(SubSites.networkNode)
            .toTarget(this.props.node.id)
            .toLink();
        navigator.goTo(nodeLink);
    }

    render() {
        return (
            <div
                className={s.nodeItem}
                onClick={this.openNode}
            >
                <IoMdLocate />
                <div className={s.nodeItemTextContainer}>
                    <span>
                        {this.props.node.id}
                    </span>
                    <div>
                        {NodeTypeHelper.getNodeTypeName(this.props.node.type)}
                    </div>
                </div>
            </div>
        );
    }
}

export default NodeItem;
