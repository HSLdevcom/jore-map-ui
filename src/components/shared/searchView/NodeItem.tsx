import React from 'react';
import { observer } from 'mobx-react';
import { IoIosRadioButtonOn } from 'react-icons/io';
import INodeBase from '~/models/baseModels/INodeBase';
import routeBuilder from '~/routing/routeBuilder';
import NodeTypeHelper from '~/util/nodeTypeHelper';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import * as s from './nodeItem.scss';

interface INodeItemProps {
    node: INodeBase;
}

const NodeItem = observer((props: INodeItemProps) => {
    const openNode = () => {
        const nodeLink = routeBuilder
            .to(SubSites.node)
            .toTarget(props.node.id)
            .toLink();
        navigator.goTo(nodeLink);
    };

    return (
        <div
            className={s.nodeItem}
            onClick={openNode}
        >
            <IoIosRadioButtonOn />
            <div className={s.nodeItemTextContainer}>
                <span>
                    {props.node.id}
                </span>
                <div>
                    {NodeTypeHelper.getNodeTypeName(props.node.type)}
                </div>
                <div>
                    {props.node.shortId}
                </div>
            </div>
        </div>
    );
});

export default NodeItem;
