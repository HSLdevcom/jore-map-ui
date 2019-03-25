import React from 'react';
import { IoIosRadioButtonOn } from 'react-icons/io';
import routeBuilder from '~/routing/routeBuilder';
import NodeTypeHelper from '~/util/nodeTypeHelper';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { INodeBase } from '~/models/INode';
import * as s from './nodeItem.scss';

interface INodeItemProps {
    node: INodeBase;
}

class NodeItem extends React.Component<INodeItemProps> {
    private openNode = () => {
        const nodeLink = routeBuilder
            .to(SubSites.node)
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
                <IoIosRadioButtonOn />
                <div className={s.nodeItemTextContainer}>
                    <span>
                        {this.props.node.id}
                    </span>
                    <div>
                        {NodeTypeHelper.getNodeTypeName(this.props.node.type)}
                    </div>
                    <div>
                        {this.props.node.shortId}
                    </div>
                </div>
            </div>
        );
    }
}

export default NodeItem;
