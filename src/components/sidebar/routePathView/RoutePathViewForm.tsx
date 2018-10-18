import * as React from 'react';
import { IRoutePath } from '~/models';
import InputContainer from '../InputContainer';
import { Button, Dropdown, Checkbox } from '../../controls';
import ButtonType from '../../../enums/buttonType';
import * as s from './routePathView.scss';

interface IRoutePathViewFormState {
    routePath: IRoutePath;
}

interface IRoutePathViewFormProps {
    isEditingDisabled: boolean;
    routePath: IRoutePath;
}

class RoutePathViewForm extends React.Component<IRoutePathViewFormProps, IRoutePathViewFormState>{
    constructor(props: IRoutePathViewFormProps) {
        super(props);
        this.state = {
            routePath: this.props.routePath,
        };
    }

    public onChange = (name: string, value: any) => {
        this.setState({
            routePath: { ...this.state.routePath, [name]: value },
        });
    }

    public onClick = () => {
        // TODO
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
                    value={this.state.routePath.routePathName}
                    name='routePathName'
                    onChange={this.onChange}
                />
                <InputContainer
                    label='REITIN NIMI RUOTSIKSI'
                    disabled={isEditingDisabled}
                    value={this.state.routePath.routePathNameSw}
                    name='routePathNameSw'
                    onChange={this.onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='LÄHTÖPAIKKA SUOMEKSI'
                    disabled={isEditingDisabled}
                    value={this.state.routePath.originFi}
                    name='originFi'
                    onChange={this.onChange}
                />
                <InputContainer
                    label='PÄÄTEPAIKKA SUOMEKSI'
                    disabled={isEditingDisabled}
                    value={this.state.routePath.destinationFi}
                    name='destinationFi'
                    onChange={this.onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='LÄHTÖPAIKKA RUOTSIKSI'
                    disabled={isEditingDisabled}
                    value={this.state.routePath.originSw}
                    name='originSw'
                    onChange={this.onChange}
                />
                <InputContainer
                    label='PÄÄTEPAIKKA RUOTSIKSI'
                    disabled={isEditingDisabled}
                    value={this.state.routePath.destinationSw}
                    name='destinationSw'
                    onChange={this.onChange}
                />
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='LYHENNE SUOMEKSI'
                    disabled={isEditingDisabled}
                    value={this.state.routePath.routePathShortName}
                    name='routePathShortName'
                    onChange={this.onChange}
                />
                <InputContainer
                    label='LYHENNE RUOTSIKSI'
                    disabled={isEditingDisabled}
                    value={this.state.routePath.routePathShortNameSw}
                    name='routePathShortNameSw'
                    onChange={this.onChange}
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
                        onClick={this.onClick}
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
                        onChange={this.onClick}
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
                    <div className={s.subTopic}>
                        SOLMUTYYPIT
                    </div>
                    <Dropdown
                        onChange={this.onClick}
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
            <div className={s.sectionDivider}/>
            <div className={s.inputContainer}>
                <div className={s.topic}>
                    KARTTA
                </div>
                <div className={s.padding} />
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
            <div className={s.padding} />
            <div className={s.inputContainer}>
                Esitettävien ajoaikojen kausi ja aikajakso
            </div>
            <div className={s.flexRow}>
                <Dropdown
                    onChange={this.onClick}
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
        );
    }
}
export default RoutePathViewForm;
