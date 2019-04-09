import React from 'react';
import { observer } from 'mobx-react';
import InputContainer from '~/components/sidebar/InputContainer';
import { IStop } from '~/models';
import ICodeListItem from '~/models/ICodeListItem';
import { codeListName } from '~/stores/codeListStore';
import { Dropdown } from '~/components/controls';
import SidebarHeader from '../SidebarHeader';
import * as s from './stopForm.scss';

interface IStopFormProps {
    stop: IStop;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
    onChange: (property: string) => (value: any) => void;
    getDropDownItems: (codeListIdentifier: codeListName) => ICodeListItem[];
}

const StopForm = observer((
    {
        stop, isEditingDisabled, onChange, invalidPropertiesMap, getDropDownItems,
    }: IStopFormProps) => {
    console.log(stop.municipality);
    return (
        <div className={s.stopView}>
            <SidebarHeader
                hideCloseButton={true}
            >
                Pysäkkitiedot
            </SidebarHeader>
            <div className={s.formSection}>
                <div className={s.sectionHeader}>
                    Nimitiedot
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='NIMI'
                        disabled={isEditingDisabled}
                        value={stop.nameFi}
                        onChange={onChange('nameFi')}
                        validationResult={invalidPropertiesMap['nameFi']}
                    />
                    <InputContainer
                        label='NIMI RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={stop.nameSe}
                        onChange={onChange('nameSe')}
                        validationResult={invalidPropertiesMap['nameSe']}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='PITKÄ NIMI'
                        disabled={isEditingDisabled}
                        value={stop.nameLongFi}
                        onChange={onChange('nameLongFi')}
                    />
                    <InputContainer
                        label='PITKÄ NIMI RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={stop.nameLongSe}
                        onChange={onChange('nameLongSe')}
                    />
                </div>
                </div>
                <div className={s.formSection}>
                <div className={s.sectionHeader}>
                    Osoitetiedot
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='PAIKAN NIMI'
                        disabled={isEditingDisabled}
                        value={stop.placeNameFi}
                        onChange={onChange('placeNameFi')}
                    />
                    <InputContainer
                        label='PAIKAN NIMI RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={stop.placeNameSe}
                        onChange={onChange('placeNameSe')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='OSOITE'
                        disabled={isEditingDisabled}
                        value={stop.addressFi}
                        onChange={onChange('addressFi')}
                    />
                    <InputContainer
                        label='OSOITE RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={stop.addressSe}
                        onChange={onChange('addressSe')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='POSTINUMERO'
                        disabled={isEditingDisabled}
                        value={stop.postalNumber}
                        onChange={onChange('postalNumber')}
                    />
                    <Dropdown
                        onChange={onChange('municipality')}
                        items={getDropDownItems('Kunta (ris/pys)')}
                        selected={stop.municipality}
                        disabled={isEditingDisabled}
                        label='KUNTA'
                    />
                </div>
                </div>
                <div className={s.formSection}>
                <div className={s.sectionHeader}>
                    Muu tiedot
                </div>
                <div className={s.flexRow}>
                    <Dropdown
                        onChange={onChange('exchangeStop')}
                        items={getDropDownItems('Kyllä/Ei')}
                        selected={stop.exchangeStop}
                        disabled={isEditingDisabled}
                        label='VAIHTOPYSÄKKI'
                    />
                    <InputContainer
                        label='LAITURI'
                        disabled={isEditingDisabled}
                        value={stop.platform}
                        onChange={onChange('platform')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='KATOS'
                        disabled={isEditingDisabled}
                        value={stop.roof}
                        onChange={onChange('roof')}
                    />
                    <InputContainer
                        label='TYYPPI'
                        disabled={isEditingDisabled}
                        value={stop.type}
                        onChange={onChange('type')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='SÄDE (m)'
                        disabled={isEditingDisabled}
                        value={stop.radius}
                        type='number'
                        onChange={onChange('radius')}
                        validationResult={invalidPropertiesMap['radius']}
                    />
                    <InputContainer
                        label='SUUNTA'
                        disabled={isEditingDisabled}
                        value={stop.direction}
                        onChange={onChange('direction')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='PAITUNNUS'
                        disabled={isEditingDisabled}
                        value={stop.hastusId}
                        onChange={onChange('hastusId')}
                    />
                    <InputContainer
                        label='TERMINAALI'
                        disabled={isEditingDisabled}
                        value={stop.terminal}
                        onChange={onChange('terminal')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='KUTSUPLUS'
                        disabled={isEditingDisabled}
                        value={stop.kutsuplus}
                        onChange={onChange('kutsuplus')}
                    />
                    <InputContainer
                        label='KUTSUPLUS VYÖHYKE'
                        disabled={isEditingDisabled}
                        value={stop.kutsuplusSection}
                        onChange={onChange('kutsuplusSection')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='KUTSUPLUS PRIORITEETTI'
                        disabled={isEditingDisabled}
                        value={stop.kutsuplusPriority}
                        onChange={onChange('kutsuplusPriority')}
                    />
                    <InputContainer
                        label='KULKUSUUNTA'
                        disabled={isEditingDisabled}
                        value={stop.courseDirection}
                        onChange={onChange('courseDirection')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='PYSÄKKIALUE'
                        disabled={isEditingDisabled}
                        value={stop.areaId}
                        onChange={onChange('areaId')}
                    />
                    <InputContainer
                        label='ELYNUMERO'
                        disabled={isEditingDisabled}
                        value={stop.elyNumber}
                        onChange={onChange('elyNumber')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='VYÖHYKE'
                        disabled={isEditingDisabled}
                        value={stop.section}
                        onChange={onChange('section')}
                    />
                    <InputContainer
                        label='TARIFFI'
                        disabled={isEditingDisabled}
                        value={stop.rate}
                        onChange={onChange('rate')}
                    />
                </div>
            </div>
        </div>
    );
});

export default StopForm;
