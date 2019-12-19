import classnames from 'classnames';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import propertyCodeLists from '~/codeLists/propertyCodeLists';
import codeListStore from '~/stores/codeListStore';
import { toDateString } from '~/util/dateHelpers';
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
    const propertyCodeList = propertyCodeLists[model];
    if (!propertyCodeList) {
        throw `Unsupported model given for savePrompt: ${model}`;
    }
    return propertyCodeList[property];
};

const _getPropertyValue = (model: Model, property: string, data: Object | null, isNew: boolean) => {
    if (!data) {
        return '';
    }

    // Some properties require a custom way to get a value for them:
    const customPropertyValueFuncObj = {
        node: {
            shortIdLetter: () => codeListStore.getCodeListLabel('Lyhyttunnus', data[property]),
            coordinates: () => (isNew ? 'Uusi sijainti' : 'Vanha sijainti'),
            coordinatesManual: () => (isNew ? 'Uusi sijainti' : 'Vanha sijainti'),
            coordinatesProjection: () => (isNew ? 'Uusi sijainti' : 'Vanha sijainti'),
            measurementDate: () => (data[property] ? toDateString(data[property]) : '')
        },
        stop: {
            municipality: () => codeListStore.getCodeListLabel('Kunta (KELA)', data[property]),
            nameModifiedOn: () => (data[property] ? toDateString(data[property]) : '')
        },
        link: {
            geometry: () => (isNew ? 'Uusi geometria' : 'Vanha geometria')
        }
    };

    const customPropertyValueFunc =
        customPropertyValueFuncObj[model] && customPropertyValueFuncObj[model][property];
    if (customPropertyValueFunc) return customPropertyValueFunc();

    return data[property] ? data[property] : '';
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
