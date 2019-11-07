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

const callRenderByProperty = (property: string, oldData: Object, newData: Object) => {
    switch (property) {
        case 'geometry':
            return renderChangeRow('Vanha geometria', 'Uusi geometria');
        case 'municipalityCode':
            return renderChangeRow(
                codeListStore!.getCodeListLabel('Kunta (KELA)', oldData[property]),
                codeListStore!.getCodeListLabel('Kunta (KELA)', newData[property])
            );
        default:
            return renderChangeRow(oldData[property], newData[property]);
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

// TODO: move to shared folder. This isn't really an overlay
const SavePrompt = observer((props: ISavePromptProps) => {
    const newData = _.cloneDeep(props.newData);
    const oldData = _.cloneDeep(props.oldData);
    for (const property in newData) {
        const linkAttribute = newData[property];
        const oldLinkAttribute = oldData[property];
        if (_.isEqual(linkAttribute, oldLinkAttribute)) {
            delete oldData[property];
            delete oldData[property];
        }
    }
    return (
        <div className={s.savePromptView}>
            <div className={s.topic}>Tallennettavat muutokset</div>
            {Object.keys(oldData).map((property: string, index: number) => {
                const propertyLabel = getLabel(props.type, property);
                return (
                    <div key={index} className={classnames(s.formItem, s.savePromptRow)}>
                        <div className={s.inputLabel}>{propertyLabel}</div>
                        {callRenderByProperty(property, oldData, newData)}
                    </div>
                );
            })}
        </div>
    );
});

export default SavePrompt;
