import * as React from 'react';
import InputContainer from '../InputContainer';
import { Button, Dropdown, Checkbox } from '../../controls';
import ButtonType from '../../../enums/buttonType';
import * as s from './routePathView.scss';

interface IRoutePathViewFormState {
}

interface IRoutePathViewFormProps {
    isEditingDisabled: boolean;
}

class RoutePathViewForm extends React.Component<IRoutePathViewFormProps, IRoutePathViewFormState>{
    constructor(props: any) {
        super(props);

    }

    // TODO
    public onChange = () => {
    }

    public render(): any {
        const isEditingDisabled = this.props.isEditingDisabled;

        return (
        <div>
            <div className={s.topic}>
                REITINSUUNNAN TIEDOT
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='REITIN NIMI SUOMEKSI'
                    disabled={isEditingDisabled}
                />
                <InputContainer
                    label='REITIN NIMI RUOTSIKSI'
                    disabled={isEditingDisabled}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='LÄHTÖPAIKKA SUOMEKSI'
                    disabled={isEditingDisabled}
                />
                <InputContainer
                    label='PÄÄTEPAIKKA SUOMEKSI'
                    disabled={isEditingDisabled}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='LÄHTÖPAIKKA RUOTSIKSI'
                    disabled={isEditingDisabled}
                />
                <InputContainer
                    label='PÄÄTEPAIKKA RUOTSIKSI'
                    disabled={isEditingDisabled}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='LYHENNE SUOMEKSI'
                    disabled={isEditingDisabled}
                />
                <InputContainer
                    label='LYHENNE RUOTSIKSI'
                    disabled={isEditingDisabled}
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
                />
                <div className={s.flexInnerRowFlexEnd}>
                    <Button
                        onClick={this.onChange}
                        type={ButtonType.ROUND}
                        text={'Laske'}
                    />
                </div>
            </div>
            <div className={s.flexRow}>
                <div className={s.inputContainer}>
                    <div className={s.subTopic}>
                        SUUNTA
                    </div>
                    <Dropdown
                        onChange={this.onChange}
                        items={['Suunta 2']}
                        selected={'Suunta 1'}
                    />
                </div>
                <div className={s.inputContainer}>
                    <div className={s.subTopic}>
                        POIKKEUSREITTI
                    </div>
                    <div className={s.padding} />
                    <div className={s.flexInnerRow}>
                        <Checkbox
                            checked={false}
                            text={'Ei'}
                            onClick={this.onChange}
                        />
                        <div className={s.flexFiller} />
                        <Checkbox
                            checked={false}
                            text={'Kyllä'}
                            onClick={this.onChange}
                        />
                        <div className={s.flexFiller} />
                    </div>
                </div>
            </div>
            <div className={s.flexRow}>
                <div className={s.flexGrow}>
                    <div className={s.subTopic}>
                        SOLMUTYYPIT
                    </div>
                    <Dropdown
                        onChange={this.onChange}
                        items={['Kaikki solmut']}
                        selected={'Kaikki solmut'}
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
            <div className={s.sectionDivider}/>
            <div className={s.flexRow}>
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                    text={'Varustelutiedot'}
                />
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                    text={'Solmu'}
                />
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                    text={'Solmut Exceliin'}
                />
            </div>
            <div className={s.flexRow}>
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                    text={'Linkki'}
                />
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                    text={'Aikataulu'}
                />
                <div className={s.flexButtonFiller} />
            </div>
            <div className={s.sectionDivider}/>
            <div className={s.inputContainer}>
                <div className={s.topic}>
                    KARTTA
                </div>
                <div className={s.padding} />
                <div className={s.flexInnerRow}>
                    <Button
                        onClick={this.onChange}
                        type={ButtonType.ROUND}
                        text={'Kartta'}
                    />
                    <Checkbox
                        checked={false}
                        text={'Muotopisteet kartalle'}
                        onClick={this.onChange}
                    />
                    <div className={s.flexButtonFiller} />
                </div>
            </div>
            <div className={s.padding} />
            <div className={s.inputContainer}>
                Esitettävien ajoaikojen kausi ja aikajakso
            </div>
            <div className={s.flexRow}>
                <Dropdown
                    onChange={this.onChange}
                    items={['Suunta 2']}
                    selected={'Suunta 1'}
                />
                <Dropdown
                    onChange={this.onChange}
                    items={['Suunta 2']}
                    selected={'Suunta 1'}
                />
            </div>
        </div>
        );
    }
}
export default RoutePathViewForm;
