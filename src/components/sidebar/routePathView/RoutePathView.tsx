import * as React from 'react';
import classnames from 'classnames';
import ViewHeader from '../ViewHeader';
import InputContainer from '../linkView/InputContainer';
import { Button, Dropdown, Checkbox } from '../../controls';
import ButtonType from '../../../enums/buttonType';
import * as s from './routePathView.scss';

class RoutePathView extends React.Component{

    // TODO
    public onChange = () => {
    }

    public render(): any {
        return (
        <div className={s.routePathView}>
            <ViewHeader
                header='Reitin suunta 1016'
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
            <div className={classnames(s.topic)}>
                REITINSUUNNAN TIEDOT
            </div>
            <div className={s.flexRow}>
                <div className={s.flexColumn}>
                    <InputContainer
                        label='REITIN NIMI SUOMEKSI'
                        placeholder='Rautatientori - Korkeasaari'
                    />
                    <InputContainer
                        label='LÄHTÖPAIKKA SUOMEKSI'
                        placeholder='Rautatientori, I. 17'
                    />
                    <InputContainer
                        label='LÄHTÖPAIKKA RUOTSIKSI'
                        placeholder='Järnvägstorget, p. 17'
                    />
                    <InputContainer
                        label='LYHENNE SUOMEKSI'
                        placeholder='Rautatient - Korkeas'
                    />
                    <div className={s.flexInnerRow}>
                        <InputContainer
                            label='VOIM. AST'
                            placeholder='01.09.2017'
                        />
                        <InputContainer
                            label='VIIM.VOIM.OLO'
                            placeholder='31.12.2050'
                        />
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
                    />
                    <InputContainer
                        label='PÄÄTEPAIKKA SUOMEKSI'
                        placeholder='Korkeasaari'
                    />
                    <InputContainer
                        label='PÄÄTEPAIKKA RUOTSIKSI'
                        placeholder='Högholmen'
                    />
                    <InputContainer
                        label='LYHENNE RUOTSIKSI'
                        placeholder='Järnvägst - Högholmen'
                    />
                    <div className={s.flexInnerRow}>
                        <InputContainer
                            label='PITUUS'
                            placeholder='8700'
                        />
                        <div className={s.inputContainer}>
                            <Button
                                onClick={this.onChange}
                                type={ButtonType.PRIMARY}
                                text={'Edellinen'}
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
        </div>
        );
    }
}
export default RoutePathView;
