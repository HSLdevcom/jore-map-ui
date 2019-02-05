import React from 'react';
import INodeBase from '~/models/baseModels/INodeBase';
import * as s from './nodeItem.scss';

interface INodeItemProps {
    node: INodeBase;
}

class NodeItem extends React.Component<INodeItemProps> {
    render() {
        return (
            <div className={s.nodeItem}>
                {this.props.node.shortId}
            </div>
        );
    }
}

export default NodeItem;
