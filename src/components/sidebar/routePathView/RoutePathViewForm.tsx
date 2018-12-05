import * as React from 'react';
import { IRoutePath } from '~/models';
import routePathValidationModel from '~/validation/models/routePathValidationModel';
import { IValidationResult } from '~/validation/FormValidator';
import InputContainer from '../InputContainer';
import LinkListView from './LinkListView';
import { Button, Dropdown, Checkbox } from '../../controls';
import ButtonType from '../../../enums/buttonType';
import * as s from './routePathView.scss';

interface IRoutePathViewFormProps {
    isEditingDisabled: boolean;
    routePath: IRoutePath;
    onChange: Function;
}

class RoutePathViewForm extends React.Component<IRoutePathViewFormProps>{
    public onClick = () => {
        // TODO
    }

    public onChange = (property: string) =>
    (value: string, validationResult: IValidationResult) => {
        this.props.onChange(property, value, validationResult);
    }

    public render(): any {
        const isEditingDisabled = this.props.isEditingDisabled;
        return (
        <div className={s.form}>
            <div className={s.formSection}>
                <div className={s.topic}>
                    REITINSUUNNAN TIEDOT
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='REITIN NIMI SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={this.props.routePath.routePathName}
                        onChange={this.onChange('routePathName')}
                        validatorRule={routePathValidationModel.nameFi}
                    />
                    <InputContainer
                        label='REITIN NIMI RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={this.props.routePath.routePathNameSw}
                        onChange={this.onChange('routePathNameSw')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='LÄHTÖPAIKKA SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={this.props.routePath.originFi}
                        onChange={this.onChange('originFi')}
                    />
                    <InputContainer
                        label='PÄÄTEPAIKKA SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={this.props.routePath.destinationFi}
                        onChange={this.onChange('destinationFi')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='LÄHTÖPAIKKA RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={this.props.routePath.originSw}
                        onChange={this.onChange('originSw')}
                    />
                    <InputContainer
                        label='PÄÄTEPAIKKA RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={this.props.routePath.destinationSw}
                        onChange={this.onChange('destinationSw')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='LYHENNE SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={this.props.routePath.routePathShortName}
                        onChange={this.onChange('routePathShortName')}
                    />
                    <InputContainer
                        label='LYHENNE RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={this.props.routePath.routePathShortNameSw}
                        onChange={this.onChange('routePathShortNameSw')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='VOIM. AST'
                        disabled={isEditingDisabled}
                    />
                    <InputContainer
                        label='VIIM.VOIM.OLO'
                        disabled={isEditingDisabled}
                    />
                    <InputContainer
                        label='PITUUS'
                        disabled={isEditingDisabled}
                        onChange={this.onChange('length')}
                        validatorRule={routePathValidationModel.length}
                    />
                    <div className={s.flexInnerRowFlexEnd}>
                        <Button
                            onClick={this.onClick}
                            type={ButtonType.ROUND}
                            text={'Laske'}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <Dropdown
                        label='SUUNTA'
                        onChange={this.onChange}
                        items={['Suunta 2']}
                        selected={'Suunta 1'}
                    />
                    <div className={s.formItem}>
                        <div className={s.inputLabel}>
                            POIKKEUSREITTI
                        </div>
                        <div className={s.flexInnerRow}>
                            <Checkbox
                                checked={false}
                                text={'Ei'}
                                onClick={this.onClick}
                            />
                            <div className={s.flexFiller} />
                            <Checkbox
                                checked={false}
                                text={'Kyllä'}
                                onClick={this.onClick}
                            />
                            <div className={s.flexFiller} />
                        </div>
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexGrow}>
                        <Dropdown
                            onChange={this.onClick}
                            items={['Kaikki solmut']}
                            selected={'Kaikki solmut'}
                            label='SOLMUTYYPIT'
                        />
                    </div>
                    <div className={s.flexFiller} />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='PÄIVITYSPVM'
                        disabled={isEditingDisabled}
                    />
                    <InputContainer
                        label='PÄIVITTÄJÄ'
                        disabled={isEditingDisabled}
                    />
                </div>
            </div>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <Button
                        onClick={this.onClick}
                        type={ButtonType.ROUND}
                        text={'Varustelutiedot'}
                    />
                    <Button
                        onClick={this.onClick}
                        type={ButtonType.ROUND}
                        text={'Solmu'}
                    />
                    <Button
                        onClick={this.onClick}
                        type={ButtonType.ROUND}
                        text={'Solmut Exceliin'}
                    />
                </div>
                <div className={s.flexRow}>
                    <Button
                        onClick={this.onClick}
                        type={ButtonType.ROUND}
                        text={'Linkki'}
                    />
                    <Button
                        onClick={this.onClick}
                        type={ButtonType.ROUND}
                        text={'Aikataulu'}
                    />
                    <div className={s.flexButtonFiller} />
                </div>
            </div>
            <div className={s.formSection}>
                <div className={s.formItem}>
                    <div className={s.topic}>
                        KARTTA
                    </div>
                    <div className={s.formItem}>
                        <div className={s.flexInnerRow}>
                            <Button
                                onClick={this.onClick}
                                type={ButtonType.ROUND}
                                text={'Kartta'}
                            />
                            <Checkbox
                                checked={false}
                                text={'Muotopisteet kartalle'}
                                onClick={this.onClick}
                            />
                            <div className={s.flexButtonFiller} />
                        </div>
                    </div>
                </div>
                <div className={s.formItem}>
                    Esitettävien ajoaikojen kausi ja aikajakso
                    <div className={s.flexInnerRow}>
                        <Dropdown
                            onChange={this.onChange}
                            items={['Suunta 2']}
                            selected={'Suunta 1'}
                        />
                        <Dropdown
                            onChange={this.onClick}
                            items={['Suunta 2']}
                            selected={'Suunta 1'}
                        />
                    </div>
                </div>
            </div>
            <LinkListView
                routePath={this.props.routePath}
            />
        </div>
        );
    }
}
export default RoutePathViewForm;
