import classnames from 'classnames';
import _ from 'lodash';
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { getLabel } from '~/codeLists/labelCodes';
import * as s from './savePrompt.scss'; // should use savePrompt.scss

const SavePrompt = (props: any) => {
    const changesContent = () => {
        const current = _.cloneDeep(props.current);
        const old = _.cloneDeep(props.old);
        const divs = [];

        for (const property in current) {
            const linkAttribute = current[property];
            const oldLinkAttribute = old[property];
            if (_.isEqual(linkAttribute, oldLinkAttribute)) {
                delete old[property];
                delete old[property];
            }
        }

        for (const property in old) {
            const propertyLabel = getLabel(props.type, property);
            divs.push(
                <div className={classnames(s.formItem, s.savePromptRow)}>
                    <div className={s.inputLabel}>{propertyLabel}</div>
                    <div className={s.flexInnerRow}>
                        <div className={s.attributeWrapper}>
                            <div className={s.oldAttribute}>{old[property]}</div>
                        </div>
                        <div className={s.arrowRightWrapper}>
                            <FiArrowRight />
                        </div>
                        <div className={s.attributeWrapper}>
                            <div className={s.newAttribute}>{current[property]}</div>
                        </div>
                    </div>
                </div>
            );
        }
        return <div className={s.savePromptView}>{divs}</div>;
    };

    return <div>{changesContent()}</div>;
};

export default SavePrompt;
