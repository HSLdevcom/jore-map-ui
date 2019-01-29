import React from 'react';
import InputContainer from '~/components/sidebar/InputContainer';
import { IStop } from '~/models';
import { Dropdown } from '~/components/controls';
import * as s from './stopForm.scss';

interface IStopFormProps {
    stop: IStop;
    onChange: () => void;
    isEditingDisabled: boolean;
}

const stopForm = ({ stop, onChange, isEditingDisabled }: IStopFormProps) => {
    return (
        <div className={s.formSection}>
            <div className={s.flexRow}>
                <InputContainer
                    label='NIMI'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='NIMI RUOTSIKSI'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='PITKÄ NIMI'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='PITKÄ NIMI RUOTSIKSI'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='PAIKAN NIMI'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='PAIKAN NIMI RUOTSIKSI'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='OSOITE'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='OSOITE RUOTSIKSI'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='POSTINUMERO'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
                <Dropdown
                    label='KUNTA'
                    onChange={onChange}
                    items={['Helsinki']}
                    // TODO: Implement
                    selected='Helsinki'
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='VAIHTOPYSÄKKI'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='LAITURI'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='KATOS'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='TYYPPI'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='SÄDE'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='SUUNTA'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='PAITUNNUS'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='TERMINAALI'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='KUTSUPLUS'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='KUTSUPLUS VYÖHYKE'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='KUTSUPLUS PRIORITEETTI'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='KULKUSUUNTA'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='PYSÄKKIALUE'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='TARIFFI'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='ELYNUMERO'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
                <InputContainer
                    label='TARIFFI'
                    disabled={isEditingDisabled}
                    value={stop.nameSe}
                    onChange={onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='VYÖHYKE'
                    disabled={isEditingDisabled}
                    value={stop.nameFi}
                    onChange={onChange}
                />
            </div>
        </div>
    );
};

export default stopForm;
