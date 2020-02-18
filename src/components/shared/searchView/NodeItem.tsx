import { observer } from 'mobx-react';
import React from 'react';
import { IoIosRadioButtonOff } from 'react-icons/io';
import NodeType from '~/enums/nodeType';
import { INodeBase } from '~/models/INode';
import NavigationUtils from '~/utils/NavigationUtils';
import NodeUtils from '~/utils/NodeUtils';
import * as s from './nodeItem.scss';

interface INodeItemProps {
    node: INodeBase;
}

const NodeItem = observer((props: INodeItemProps) => {
    const { node } = props;

    return (
        <div
            className={s.nodeItem}
            onClick={() => NavigationUtils.openNodeView({ nodeId: props.node.id })}
            data-cy='nodeItem'
        >
            <IoIosRadioButtonOff />
            <div className={s.nodeItemTextContainer}>
                <span>{node.id}</span>
                <div>{NodeUtils.getNodeTypeName(node.type)}</div>
                {node.type === NodeType.STOP && <div>{NodeUtils.getShortId(node)}</div>}
            </div>
        </div>
    );
});

export default NodeItem;
