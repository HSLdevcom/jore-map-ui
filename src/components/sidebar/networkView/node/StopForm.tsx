import React from 'react';
import InputContainer from '~/components/sidebar/InputContainer';
import { IStop } from '~/models';
import MunicipalityDropdown from '~/components/controls/MunicipalityDropdown';
import ViewHeader from '../../ViewHeader';
import * as s from './stopForm.scss';

interface IStopFormProps {
    stop: IStop;
    onChange: () => void;
    isEditingDisabled: boolean;
}

const stopForm = ({ stop, onChange, isEditingDisabled }: IStopFormProps) => {
    return (
        <div className={s.stopView}>
          <ViewHeader
              hideCloseButton={true}
          >
              Pysäkkitiedot
          </ViewHeader>
          <div className={s.formSection}>
              <div className={s.sectionHeader}>
                Nimitiedot
              </div>
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
                      value={stop.nameLongFi}
                      onChange={onChange}
                  />
                  <InputContainer
                      label='PITKÄ NIMI RUOTSIKSI'
                      disabled={isEditingDisabled}
                      value={stop.nameLongSe}
                      onChange={onChange}
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
                      onChange={onChange}
                  />
                  <InputContainer
                      label='PAIKAN NIMI RUOTSIKSI'
                      disabled={isEditingDisabled}
                      value={stop.placeNameSe}
                      onChange={onChange}
                  />
              </div>
              <div className={s.flexRow}>
                  <InputContainer
                      label='OSOITE'
                      disabled={isEditingDisabled}
                      value={stop.addressFi}
                      onChange={onChange}
                  />
                  <InputContainer
                      label='OSOITE RUOTSIKSI'
                      disabled={isEditingDisabled}
                      value={stop.addressSe}
                      onChange={onChange}
                  />
              </div>
              <div className={s.flexRow}>
                  <InputContainer
                      label='POSTINUMERO'
                      disabled={isEditingDisabled}
                      value={stop.postalNumber}
                      onChange={onChange}
                  />
                  <MunicipalityDropdown
                    disabled={isEditingDisabled}
                    value={stop.municipality}
                    onChange={onChange}
                    label='KUNTA'
                  />
              </div>
            </div>
            <div className={s.formSection}>
              <div className={s.sectionHeader}>
                Muu tiedot
              </div>
              <div className={s.flexRow}>
                  <InputContainer
                      label='VAIHTOPYSÄKKI'
                      disabled={isEditingDisabled}
                      value={stop.exchangeStop}
                      onChange={onChange}
                  />
                  <InputContainer
                      label='LAITURI'
                      disabled={isEditingDisabled}
                      value={stop.platform}
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
                      value={stop.type}
                      onChange={onChange}
                  />
              </div>
              <div className={s.flexRow}>
                  <InputContainer
                      label='SÄDE'
                      disabled={isEditingDisabled}
                      value={stop.radius}
                      onChange={onChange}
                  />
                  <InputContainer
                      label='SUUNTA'
                      disabled={isEditingDisabled}
                      value={stop.direction}
                      onChange={onChange}
                  />
              </div>
              <div className={s.flexRow}>
                  <InputContainer
                      label='PAITUNNUS'
                      disabled={isEditingDisabled}
                      value={stop.hastusId}
                      onChange={onChange}
                  />
                  <InputContainer
                      label='TERMINAALI'
                      disabled={isEditingDisabled}
                      value={stop.terminal}
                      onChange={onChange}
                  />
              </div>
              <div className={s.flexRow}>
                  <InputContainer
                      label='KUTSUPLUS'
                      disabled={isEditingDisabled}
                      value={stop.kutsuplus}
                      onChange={onChange}
                  />
                  <InputContainer
                      label='KUTSUPLUS VYÖHYKE'
                      disabled={isEditingDisabled}
                      value={stop.kutsuplusSection}
                      onChange={onChange}
                  />
              </div>
              <div className={s.flexRow}>
                  <InputContainer
                      label='KUTSUPLUS PRIORITEETTI'
                      disabled={isEditingDisabled}
                      value={stop.kutsuplusPriority}
                      onChange={onChange}
                  />
                  <InputContainer
                      label='KULKUSUUNTA'
                      disabled={isEditingDisabled}
                      value={stop.courseDirection}
                      onChange={onChange}
                  />
              </div>
              <div className={s.flexRow}>
                  <InputContainer
                      label='PYSÄKKIALUE'
                      disabled={isEditingDisabled}
                      value={stop.areaId}
                      onChange={onChange}
                  />
                  <InputContainer
                      label='ELYNUMERO'
                      disabled={isEditingDisabled}
                      value={stop.elyNumber}
                      onChange={onChange}
                  />
              </div>
              <div className={s.flexRow}>
                  <InputContainer
                      label='VYÖHYKE'
                      disabled={isEditingDisabled}
                      value={stop.section}
                      onChange={onChange}
                  />
                  <InputContainer
                      label='TARIFFI'
                      disabled={isEditingDisabled}
                      value={stop.rate}
                      onChange={onChange}
                  />
              </div>
          </div>
        </div>
    );
};

export default stopForm;
