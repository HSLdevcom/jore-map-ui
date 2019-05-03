import * as React from 'react';
import { ILink, INode } from '~/models';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import NodeHelper from '~/util/nodeHelper';
import NodeType from '~/enums/nodeType';
import TextContainer from '../TextContainer';
import * as s from './splitLinkInfo.scss';

interface ISplitLinkInfoProps {
    link: ILink;
    node: INode;
}

const SplitLinkInfo = (props: ISplitLinkInfoProps) => (
    <div className={s.splitLinkInfo}>
        <div className={s.formSection}>
            <div className={s.sectionHeader}>Jaettava linkki</div>
            <div className={s.flexRow}>
                <TextContainer
                    label='ALKUSOLMU'
                    value={props.link.startNode.id}
                />
                <TextContainer
                    label='LOPPUSOLMU'
                    value={props.link.endNode.id}
                />
            </div>
            <div className={s.flexRow}>
                <TextContainer
                    label='VERKKO'
                    value={TransitTypeHelper.getTransitTypeLabel(
                        props.link.transitType!
                    )}
                />
            </div>
        </div>
        <div className={s.formSection}>
            <div className={s.sectionHeader}>Jakava solmu</div>
            <div className={s.flexRow}>
                <TextContainer label='ID' value={props.node.id} />
                <TextContainer
                    label='LYHYT ID'
                    value={NodeHelper.getShortId(props.node)}
                />
            </div>
            <div className={s.flexRow}>
                <TextContainer label='TYYPPI' value={props.node.type} />
                {props.node.type === NodeType.STOP && (
                    <TextContainer
                        label='PYSÄKIN NIMI'
                        value={props.node.stop!.nameFi}
                    />
                )}
            </div>
        </div>
    </div>
);

export default SplitLinkInfo;
