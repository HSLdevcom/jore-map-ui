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
import * as s from './savePrompt.scss';

type Model = 'node' | 'stop' | 'link' | 'route' | 'stopArea';

interface ISaveModel {
    model: Model;
    newData: Object;
    oldData: Object;
}

interface ISavePromptProps {
    saveModels: ISaveModel[];
}

const renderSaveModelSection = (saveModel: ISaveModel, key: string) => {
    const newData = _.cloneDeep(saveModel.newData);
    const oldData = _.cloneDeep(saveModel.oldData);
    for (const property in newData) {
        const linkAttribute = newData[property];
        const oldLinkAttribute = oldData[property];
        if (_.isEqual(linkAttribute, oldLinkAttribute)) {
            delete oldData[property];
            delete oldData[property];
        }
    }
    return (
        <div key={key}>
            {Object.keys(oldData).map((property: string, index: number) => {
                const propertyLabel = _getLabel(saveModel.model, property);
                return (
                    <div
                        key={`${key}-${index}`}
                        className={classnames(s.formItem, s.savePromptRow)}
                    >
                        <div className={s.inputLabel}>{propertyLabel}</div>
                        {renderChangeRow(
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

const _getPropertyValue = (model: Model, property: string, data: Object, isNew: boolean) => {
    const customPropertyValueMap: { [key in Model]: any } = {
        node: {
            shortIdLetter: codeListStore.getCodeListLabel('Lyhyttunnus', data[property]),
            tripTimePoint: codeListStore.getCodeListLabel('Kyllä/Ei', data[property]),
            coordinates: isNew ? 'Uusi sijainti' : 'Vanha sijainti',
            coordinatesManual: isNew ? 'Uusi sijainti' : 'Vanha sijainti',
            coordinatesProjection: isNew ? 'Uusi sijainti' : 'Vanha sijainti'
        },
        stop: {
            municipality: codeListStore.getCodeListLabel('Kunta (KELA)', data[property])
        },
        link: {
            geometry: isNew ? 'Uusi geometria' : 'Vanha geometria',
            municipalityCode: codeListStore.getCodeListLabel('Kunta (KELA)', data[property])
        },
        route: {},
        stopArea: {}
    };
    return customPropertyValueMap[model][property]
        ? customPropertyValueMap[model][property]
        : data[property];
};

const renderChangeRow = (oldValue: string, newValue: string) => {
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
            {saveModels.map((saveModel: ISaveModel, index: number) =>
                renderSaveModelSection(saveModel, `saveModelRowSection-${index}`)
            )}
        </div>
    );
});

export default SavePrompt;

export { Model, ISaveModel };
