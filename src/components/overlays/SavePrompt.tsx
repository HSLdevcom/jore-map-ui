import classnames from 'classnames';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { getLabel } from '~/codeLists/labelCodes';
import codeListStore from '~/stores/codeListStore';
import * as s from './savePrompt.scss';

interface ISavePromptProps {
    newData: Object;
    oldData: Object;
    type: string;
}

const callRenderByProperty = (property: string, oldLink: Object, newLink: Object) => {
    switch (property) {
        case 'geometry':
            return renderChangeRow('Vanha geometria', 'Uusi geometria');
        case 'municipalityCode':
            return renderChangeRow(
                codeListStore!.getCodeListLabel('Kunta (KELA)', oldLink[property]),
                codeListStore!.getCodeListLabel('Kunta (KELA)', newLink[property])
            );
        default:
            return renderChangeRow(oldLink[property], newLink[property]);
    }
};

const renderChangeRow = (oldValue: string, newValue: string) => {
    return (
        <div className={s.flexInnerRow}>
            <div className={s.attributeWrapper}>
                <div className={s.oldAttribute}>{oldValue}</div>
            </div>
            <div className={s.arrowRightWrapper}>
                <FiArrowRight />
            </div>
            <div className={s.attributeWrapper}>
                <div className={s.newAttribute}>{newValue}</div>
            </div>
        </div>
    );
};

const SavePrompt = observer((props: ISavePromptProps) => {
    const newLink = _.cloneDeep(props.newData);
    const oldLink = _.cloneDeep(props.oldData);
    for (const property in newLink) {
        const linkAttribute = newLink[property];
        const oldLinkAttribute = oldLink[property];
        if (_.isEqual(linkAttribute, oldLinkAttribute)) {
            delete oldLink[property];
            delete oldLink[property];
        }
    }
    return (
        <div className={s.savePromptView}>
            <div className={s.topic}>Tallennettavat muutokset</div>
            {Object.keys(oldLink).map((property: string, index: number) => {
                const propertyLabel = getLabel(props.type, property);
                return (
                    <div key={index} className={classnames(s.formItem, s.savePromptRow)}>
                        <div className={s.inputLabel}>{propertyLabel}</div>
                        {callRenderByProperty(property, oldLink, newLink)}
                    </div>
                );
            })}
        </div>
    );
});

export default SavePrompt;
