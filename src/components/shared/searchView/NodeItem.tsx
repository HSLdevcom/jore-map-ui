import { observer } from 'mobx-react';
import React from 'react';
import { IoIosRadioButtonOn } from 'react-icons/io';
import NodeType from '~/enums/nodeType';
import { INodeBase } from '~/models/INode';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import NodeUtils from '~/utils/NodeUtils';
import * as s from './nodeItem.scss';

interface INodeItemProps {
    node: INodeBase;
}

const NodeItem = observer((props: INodeItemProps) => {
    const { node } = props;
    const openNode = () => {
        const nodeViewLink = routeBuilder
            .to(SubSites.node)
            .toTarget(':id', node.id)
            .toLink();
        navigator.goTo({ link: nodeViewLink });
    };

    return (
        <div className={s.nodeItem} onClick={openNode} data-cy='nodeItem'>
            <IoIosRadioButtonOn />
            <div className={s.nodeItemTextContainer}>
                <span>{node.id}</span>
                <div>{NodeUtils.getNodeTypeName(node.type)}</div>
                {node.type === NodeType.STOP && <div>{NodeUtils.getShortId(node)}</div>}
            </div>
        </div>
    );
});

export default NodeItem;
