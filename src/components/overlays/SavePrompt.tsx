import classnames from 'classnames';
import _ from 'lodash';
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { getLabel } from '~/codeLists/labelCodes';
import * as s from './savePrompt.scss';

const SavePrompt = (props: any) => {
    const renderChangesContent = () => {
        const current = _.cloneDeep(props.current);
        const old = _.cloneDeep(props.old);
        for (const property in current) {
            const linkAttribute = current[property];
            const oldLinkAttribute = old[property];
            if (_.isEqual(linkAttribute, oldLinkAttribute)) {
                delete old[property];
                delete old[property];
            }
        }

        return Object.keys(old).map((property: string, index: number) => {
            const propertyLabel = getLabel(props.type, property);
            return (
                <div key={index} className={classnames(s.formItem, s.savePromptRow)}>
                    <div className={s.inputLabel}>{propertyLabel}</div>
                    {property === 'geometry'
                        ? renderGeometryChangeRow()
                        : renderChangeRow(old[property], current[property])}
                </div>
            );
        });
    };

    const renderChangeRow = (oldValue: string, currentValue: string) => {
        return (
            <div className={s.flexInnerRow}>
                <div className={s.attributeWrapper}>
                    <div className={s.oldAttribute}>{oldValue}</div>
                </div>
                <div className={s.arrowRightWrapper}>
                    <FiArrowRight />
                </div>
                <div className={s.attributeWrapper}>
                    <div className={s.newAttribute}>{currentValue}</div>
                </div>
            </div>
        );
    };

    const renderGeometryChangeRow = () => {
        return (
            <div className={s.flexInnerRow}>
                <div>Linkin geometria muuttunut.</div>
            </div>
        );
    };

    return (
        <div className={s.savePromptView}>
            <div className={s.topic}>Tallennettavat muutokset</div>
            {renderChangesContent()}
        </div>
    );
};

export default SavePrompt;
