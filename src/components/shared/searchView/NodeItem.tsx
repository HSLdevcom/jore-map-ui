import { observer } from 'mobx-react';
import React from 'react';
import { IoIosRadioButtonOn } from 'react-icons/io';
import { INodeBase } from '~/models/INode';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import NodeHelper from '~/util/NodeHelper';
import * as s from './nodeItem.scss';

interface INodeItemProps {
    node: INodeBase;
}

const NodeItem = observer((props: INodeItemProps) => {
    const openNode = () => {
        const nodeViewLink = routeBuilder
            .to(SubSites.node)
            .toTarget(':id', props.node.id)
            .toLink();
        navigator.goTo({ link: nodeViewLink });
    };

    return (
        <div className={s.nodeItem} onClick={openNode}>
            <IoIosRadioButtonOn />
            <div className={s.nodeItemTextContainer}>
                <span>{props.node.id}</span>
                <div>{NodeHelper.getNodeTypeName(props.node.type)}</div>
                <div>{NodeHelper.getShortId(props.node)}</div>
            </div>
        </div>
    );
});

export default NodeItem;
