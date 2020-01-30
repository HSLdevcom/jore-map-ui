import classnames from 'classnames';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import propertyCodeLists from '~/codeLists/propertyCodeLists';
import NodeMeasurementType from '~/enums/nodeMeasurementType';
import codeListStore from '~/stores/codeListStore';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import { toDateString } from '~/utils/dateUtils';
import * as s from './savePrompt.scss';

type Model = 'node' | 'stop' | 'link' | 'route' | 'stopArea' | 'line' | 'routePath' | 'lineHeader';

interface ISaveModel {
    type: 'saveModel';
    model: Model;
    newData: Object | null;
    oldData: Object | null;
    subTopic?: string;
    isRemoved?: boolean;
}

interface ITextModel {
    type: 'textModel';
    subTopic: string;
    newText: string;
    oldText: string;
}

interface ISavePromptProps {
    models: (ISaveModel | ITextModel)[];
}

const PREVENTED_CHANGE_ROW_PROPERTIES = ['modifiedOn', 'modifiedBy'];

const renderSaveModelSection = (saveModel: ISaveModel, key: string) => {
    const newData = _.cloneDeep(saveModel.newData);
    const oldData = _.cloneDeep(saveModel.oldData);
    for (const property in newData) {
        const newValue = newData[property];
        const oldValue = oldData ? oldData[property] : '';
        if (_.isEqual(newValue, oldValue) || (!newValue && !oldValue)) {
            delete newData[property];
        }
    }
    if (newData && !Object.keys(newData).length) return;
    return (
        <div className={s.savePromptItem} key={key}>
            {saveModel.subTopic && <div className={s.subTopic}>{saveModel.subTopic}</div>}
            {saveModel.isRemoved ? (
                <div className={s.removedItemWrapper}>
                    <div className={s.oldAttribute}>Poistettu</div>
                </div>
            ) : (
                Object.keys(newData!).map((property: string, index: number) => {
                    if (PREVENTED_CHANGE_ROW_PROPERTIES.includes(property)) return null;

                    const propertyLabel = _getLabel(saveModel.model, property);
                    return (
                        <div
                            key={`${key}-${index}`}
                            className={classnames(s.formItem, s.savePromptRow)}
                        >
                            <div className={s.inputLabel}>{propertyLabel}</div>
                            {renderChangeRow(
                                _getPropertyValue(saveModel.model, property, oldData, false),
                                _getPropertyValue(saveModel.model, property, newData, true),
                                property
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

const renderTextModelSection = (textModel: ITextModel, key: string) => {
    return (
        <div className={s.savePromptItem} key={key}>
            <div className={s.subTopic}>{textModel.subTopic}</div>
            <div className={classnames(s.formItem, s.savePromptRow)}>
                {renderChangeRow(textModel.oldText, textModel.newText)}
            </div>
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

    const value = data[property];
    // Some properties require a custom way to get a value for them:
    const customPropertyValueFuncObj = {
        node: {
            shortIdLetter: () => codeListStore.getCodeListLabel('Lyhyttunnus', value),
            coordinates: () => (isNew ? 'Uusi sijainti' : 'Vanha sijainti'),
            coordinatesManual: () => (isNew ? 'Uusi sijainti' : 'Vanha sijainti'),
            coordinatesProjection: () => (isNew ? 'Uusi sijainti' : 'Vanha sijainti'),
            measurementDate: () => (value ? toDateString(value) : ''),
            measurementType: () =>
                value === NodeMeasurementType.Calculated ? 'Laskettu' : 'Mitattu'
        },
        stop: {
            municipality: () => codeListStore.getCodeListLabel('Kunta (KELA)', value),
            nameModifiedOn: () => (value ? toDateString(value) : '')
        },
        link: {
            geometry: () => (isNew ? 'Uusi geometria' : 'Vanha geometria'),
            municipalityCode: () => codeListStore.getCodeListLabel('Kunta (KELA)', value)
        },
        line: {
            lineStartDate: () => (value ? toDateString(value) : ''),
            lineEndDate: () => (value ? toDateString(value) : ''),
            publicTransportType: () => codeListStore.getCodeListLabel('Joukkoliikennelaji', value),
            clientOrganization: () => codeListStore.getCodeListLabel('Tilaajaorganisaatio', value),
            publicTransportDestination: () =>
                codeListStore.getCodeListLabel('Joukkoliikennekohde', value),
            lineReplacementType: () =>
                codeListStore.getCodeListLabel('LinjanKorvaavaTyyppi', value),
            transitType: () => (value ? TransitTypeUtils.getTransitTypeLabel(value) : '')
        },
        routePath: {
            startTime: () => (value ? toDateString(value) : ''),
            endTime: () => (value ? toDateString(value) : ''),
            routePathLinks: () =>
                isNew
                    ? 'Uudet reitinsuunnan linkit ja solmut'
                    : 'Vanhat reitinsuunnan linkit ja solmut',
            exceptionPath: () => codeListStore.getCodeListLabel('Kyllä/Ei', value)
        },
        lineHeader: {
            startDate: () => (value ? toDateString(value) : ''),
            endDate: () => (value ? toDateString(value) : ''),
            originalStartDate: () => (value ? toDateString(value) : '')
        }
    };

    const customPropertyValueFunc =
        customPropertyValueFuncObj[model] && customPropertyValueFuncObj[model][property];
    if (customPropertyValueFunc) return customPropertyValueFunc();

    return value ? value : '';
};

const renderChangeRow = (oldValue: string, newValue: string, property?: string) => {
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
    const models = props.models;
    return (
        <div className={s.savePromptView} data-cy='savePromptView'>
            <div className={s.topic}>Tallennettavat muutokset</div>
            <div className={s.savePromptContent}>
                {models.map((model: ISaveModel | ITextModel, index: number) => {
                    return model.type === 'saveModel'
                        ? renderSaveModelSection(model, `saveModelRowSection-${index}`)
                        : renderTextModelSection(model, `textModelRowSection-${index}`);
                })}
            </div>
        </div>
    );
});

export default SavePrompt;

export { Model, ISaveModel, ITextModel };
