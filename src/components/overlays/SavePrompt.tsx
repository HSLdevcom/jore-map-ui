import classnames from 'classnames';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import {
    linkPropertyCodeList,
    nodePropertyCodeList,
    routePropertyCodeList,
    stopAreaPropertyCodeList,
    stopPropertyCodeList
} from '~/codeLists/propertyCodeList';
import codeListStore from '~/stores/codeListStore';
import { dateToDateString } from '~/util/dateFormatHelpers';
import * as s from './savePrompt.scss';

type Model = 'node' | 'stop' | 'link' | 'route' | 'stopArea';

interface ISaveModel {
    model: Model;
    newData: Object;
    oldData: Object | null;
}

interface ISavePromptProps {
    saveModels: ISaveModel[];
}

const PREVENTED_CHANGE_ROW_PROPERTIES = ['modifiedOn', 'modifiedBy'];

const renderSaveModelSection = (saveModel: ISaveModel, key: string) => {
    const newData = _.cloneDeep(saveModel.newData);
    const oldData = _.cloneDeep(saveModel.oldData);
    for (const property in newData) {
        const newValue = newData[property];
        const oldValue = oldData ? oldData[property] : '';
        if (_.isEqual(newValue, oldValue)) {
            delete newData[property];
        }
    }
    return (
        <div key={key}>
            {Object.keys(newData).map((property: string, index: number) => {
                if (PREVENTED_CHANGE_ROW_PROPERTIES.includes(property)) return null;

                const propertyLabel = _getLabel(saveModel.model, property);
                return (
                    <div
                        key={`${key}-${index}`}
                        className={classnames(s.formItem, s.savePromptRow)}
                    >
                        <div className={s.inputLabel}>{propertyLabel}</div>
                        {renderChangeRow(
                            property,
                            _getPropertyValue(saveModel.model, property, oldData, false),
                            _getPropertyValue(saveModel.model, property, newData, true)
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const _getLabel = (model: Model, property: string) => {
    switch (model) {
        case 'node':
            return nodePropertyCodeList[property];
        case 'stop':
            return stopPropertyCodeList[property];
        case 'link':
            return linkPropertyCodeList[property];
        case 'route':
            return routePropertyCodeList[property];
        case 'stopArea':
            return stopAreaPropertyCodeList[property];
        default:
            throw `Unsupported model given for savePrompt: ${model}`;
    }
};

const _getPropertyValue = (model: Model, property: string, data: Object | null, isNew: boolean) => {
    if (!data) {
        return '';
    }

    // Some properties require a custom way to get a value for them:
    switch (model) {
        case 'node':
            switch (property) {
                case 'shortIdLetter':
                    return codeListStore.getCodeListLabel('Lyhyttunnus', data[property]);
                case 'tripTimePoint':
                    return codeListStore.getCodeListLabel('Kyllä/Ei', data[property]);
                case 'coordinates':
                    return isNew ? 'Uusi sijainti' : 'Vanha sijainti';
                case 'coordinatesManual':
                    return isNew ? 'Uusi sijainti' : 'Vanha sijainti';
                case 'coordinatesProjection':
                    return isNew ? 'Uusi sijainti' : 'Vanha sijainti';
                case 'measurementDate':
                    return data[property] ? dateToDateString(data[property]) : '';
            }
        case 'stop':
            switch (property) {
                case 'municipality':
                    return codeListStore.getCodeListLabel('Kunta (KELA)', data[property]);
                case 'nameModifiedOn':
                    return data[property] ? dateToDateString(data[property]) : '';
            }
        case 'link':
            switch (property) {
                case 'geometry':
                    return isNew ? 'Uusi geometria' : 'Vanha geometria';
                case 'municipalityCode':
                    return codeListStore.getCodeListLabel('Kunta (KELA)', data[property]);
            }
        default:
            return data[property] ? data[property] : '';
    }
};

const renderChangeRow = (property: string, oldValue: string, newValue: string) => {
    if (typeof oldValue === 'object' || typeof newValue === 'object') {
        throw `SavePrompt renderChangeRow: given value was an object instead of string, property: ${property}`;
    }
    return (
        <div className={s.flexInnerRow}>
            <div className={s.attributeWrapper}>
                {oldValue && <div className={s.oldAttribute}>{oldValue}</div>}
            </div>
            <div className={s.arrowRightWrapper}>
                <FiArrowRight />
            </div>
            <div className={s.attributeWrapper}>
                {newValue && <div className={s.newAttribute}>{newValue}</div>}
            </div>
        </div>
    );
};

// TODO: move to shared folder. This isn't really an overlay
const SavePrompt = observer((props: ISavePromptProps) => {
    const saveModels = props.saveModels;

    return (
        <div className={s.savePromptView}>
            <div className={s.topic}>Tallennettavat muutokset</div>
            <div className={s.savePromptContent}>
                {saveModels.map((saveModel: ISaveModel, index: number) =>
                    renderSaveModelSection(saveModel, `saveModelRowSection-${index}`)
                )}
            </div>
        </div>
    );
});

export default SavePrompt;

export { Model, ISaveModel };
