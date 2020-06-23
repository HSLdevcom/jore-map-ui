import { observer } from 'mobx-react';
import React from 'react';
import NodeType from '~/enums/nodeType';
import { ISearchNode } from '~/models/INode';
import NavigationUtils from '~/utils/NavigationUtils';
import NodeUtils from '~/utils/NodeUtils';
import TransitTypeNodeIcon from '../TransitTypeNodeIcon';
import * as s from './nodeItem.scss';

interface INodeItemProps {
    node: ISearchNode;
}

const NodeItem = observer((props: INodeItemProps) => {
    const { node } = props;

    return (
        <div
            className={s.nodeItem}
            onClick={() => NavigationUtils.openNodeView({ nodeId: props.node.id })}
            data-cy={`nodeItem${node.type}`}
        >
            <div className={s.nodeIconWrapper}>
                <TransitTypeNodeIcon nodeType={node.type} transitTypes={node.transitTypes} />
            </div>
            <div className={s.nodeItemTextContainer}>
                <span>{node.id}</span>
                <div>{NodeUtils.getNodeTypeName(node.type)}</div>
                {node.type === NodeType.STOP && <div>{NodeUtils.getShortId(node)}</div>}
            </div>
        </div>
    );
});

export default NodeItem;
