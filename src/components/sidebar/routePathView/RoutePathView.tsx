import * as React from 'react';
import classnames from 'classnames';
import ViewHeader from '../ViewHeader';
import InputContainer from '../linkView/InputContainer';
import { Button, Dropdown, Checkbox } from '../../controls';
import ButtonType from '../../../enums/buttonType';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    isEditingDisabled: boolean;
}

interface IRoutePathViewProps {
}

class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: any) {
        super(props);
        this.state = {
            isEditingDisabled: true,
        };
    }

    public onEditButtonClick = () => {
        const isEditingDisabled = !this.state.isEditingDisabled;
        this.setState({ isEditingDisabled });
    }

    // TODO
    public onChange = () => {
    }

    public render(): any {
        return (
        <div className={s.routePathView}>
            <ViewHeader
                header='Reitin suunta 1016'
                onEditButtonClick={this.onEditButtonClick}
            />
            <div className={s.routePathTimestamp}>01.09.2017</div>
            <div className={s.topic}>
                REITIN OTSIKKOTIEDOT
            </div>
            <div className={s.routeInformationContainer}>
                <div className={s.flexInnerColumn}>
                    <div>Reittitunnus</div>
                    <div>1016</div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div>Linja</div>
                    <div>1016</div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div>Päivityspvm</div>
                    <div>23.08.2017</div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div>Päivittää</div>
                    <div>Vuori Tuomas</div>
                </div>
            </div>
            <div className={s.sectionDivider} />
            <div className={s.padding} />
            <div className={classnames(s.topic)}>
                REITINSUUNNAN TIEDOT
            </div>
            <div className={s.flexRow}>
                <div className={s.flexColumn}>
                    <InputContainer
                        label='REITIN NIMI SUOMEKSI'
                        placeholder='Rautatientori - Korkeasaari'
                        disabled={this.state.isEditingDisabled}
                    />
                    <InputContainer
                        label='LÄHTÖPAIKKA SUOMEKSI'
                        placeholder='Rautatientori, I. 17'
                        disabled={this.state.isEditingDisabled}
                    />
                    <InputContainer
                        label='LÄHTÖPAIKKA RUOTSIKSI'
                        placeholder='Järnvägstorget, p. 17'
                        disabled={this.state.isEditingDisabled}
                    />
                    <InputContainer
                        label='LYHENNE SUOMEKSI'
                        placeholder='Rautatient - Korkeas'
                        disabled={this.state.isEditingDisabled}
                    />
                    <div className={s.flexInnerRow}>
                        <InputContainer
                            label='VOIM. AST'
                            placeholder='01.09.2017'
                            disabled={this.state.isEditingDisabled}
                        />
                        <InputContainer
                            label='VIIM.VOIM.OLO'
                            placeholder='31.12.2050'
                            disabled={this.state.isEditingDisabled}
                        />
                        <div />
                    </div>
                    <div className={s.inputContainer}>
                        <div className={classnames(s.subTopic)}>
                            SUUNTA
                        </div>
                        <Dropdown
                            onChange={this.onChange}
                            items={['Suunta 2']}
                            selected={'Suunta 1'}
                        />
                    </div>
                    <div className={s.inputContainer}>
                        <div className={classnames(s.subTopic)}>
                            SOLMUTYYPIT
                        </div>
                        <Dropdown
                            onChange={this.onChange}
                            items={['Kaikki solmut']}
                            selected={'Kaikki solmut'}
                        />
                    </div>
                </div>
                <div className={s.flexColumn}>
                    <InputContainer
                        label='REITIN NIMI RUOTSIKSI'
                        placeholder='Järnvägstorget - Högholmen'
                        disabled={this.state.isEditingDisabled}
                    />
                    <InputContainer
                        label='PÄÄTEPAIKKA SUOMEKSI'
                        placeholder='Korkeasaari'
                        disabled={this.state.isEditingDisabled}
                    />
                    <InputContainer
                        label='PÄÄTEPAIKKA RUOTSIKSI'
                        placeholder='Högholmen'
                        disabled={this.state.isEditingDisabled}
                    />
                    <InputContainer
                        label='LYHENNE RUOTSIKSI'
                        placeholder='Järnvägst - Högholmen'
                        disabled={this.state.isEditingDisabled}
                    />
                    <div className={s.flexInnerRow}>
                        <InputContainer
                            label='PITUUS'
                            placeholder='8700'
                            disabled={this.state.isEditingDisabled}
                        />
                        <div className={s.calculateButtonContainer}>
                            <Button
                                onClick={this.onChange}
                                type={ButtonType.ROUND}
                                text={'Laske'}
                            />
                        </div>
                    </div>
                    <div className={s.inputContainer}>
                        <div className={s.subTopic}>
                            POIKKEUSREITTI
                        </div>
                        <div className={s.checkBoxContainer}>
                            <div className={s.flexInnerRow}>
                                <div className={s.flexInnerRow}>
                                    <Checkbox
                                        checked={false}
                                        text={'Ei'}
                                        onClick={this.onChange}
                                    />
                                </div>
                                <div className={s.flexInnerRow}>
                                    <Checkbox
                                        checked={false}
                                        text={'Kyllä'}
                                        onClick={this.onChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={s.flexRow}>
                <InputContainer
                    label='PÄIVITYSPVM'
                    placeholder='23.08.2017'
                    disabled={this.state.isEditingDisabled}
                />
                <InputContainer
                    label='PÄIVITTÄJÄ'
                    placeholder='Vuori Tuomas'
                    disabled={this.state.isEditingDisabled}
                />
            </div>
            <div className={s.sectionDivider}/>
            <div className={s.flexRow}>
                <div className={s.flexInnerColumn}>
                    <div className={s.inputContainer}>
                        <Button
                            onClick={this.onChange}
                            type={ButtonType.ROUND}
                            text={'Varustelutiedot'}
                        />
                    </div>
                    <div className={s.inputContainer}>
                        <Button
                            onClick={this.onChange}
                            type={ButtonType.ROUND}
                            text={'Solmu'}
                        />
                    </div>
                    <div />
                </div>
                <div className={s.flexInnerColumn}>
                    <div className={s.inputContainer}>
                        <Button
                            onClick={this.onChange}
                            type={ButtonType.ROUND}
                            text={'Solmut Exceliin'}
                        />
                    </div>
                    <div className={s.inputContainer}>
                        <Button
                            onClick={this.onChange}
                            type={ButtonType.ROUND}
                            text={'Linkki'}
                        />
                    </div>
                    <div />
                </div>
                <div className={s.flexInnerColumn}>
                    <div className={s.inputContainer}>
                        <Button
                            onClick={this.onChange}
                            type={ButtonType.ROUND}
                            text={'Aikataulu'}
                        />
                    </div>
                </div>
            </div>
            <div className={s.sectionDivider}/>
            <div className={s.inputContainer}>
                <div className={s.topic}>
                    KARTTA
                </div>
                <div className={s.padding} />
                <div className={s.flexRow}>
                    <Button
                        onClick={this.onChange}
                        type={ButtonType.ROUND}
                        text={'Kartta'}
                    />
                    <div className={s.mapCheckboxContainer}>
                        <Checkbox
                            checked={false}
                            text={'Muotopisteet kartalle'}
                            onClick={this.onChange}
                        />
                    </div>
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
export default RoutePathView;
