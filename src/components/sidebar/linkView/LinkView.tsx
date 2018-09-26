import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { Checkbox, Dropdown, Button } from '../../controls';
import ButtonType from '../../../enums/buttonType';
import InputContainer from './InputContainer';
import MultiTabInput from './MultiTabInput';
import { SidebarStore } from '../../../stores/sidebarStore';
import SidebarViewHeader from '../SidebarViewHeader';
import * as s from './linkView.scss';

interface ILinkViewState {
}

interface ILinkViewProps {
    sidebarStore?: SidebarStore;
}

@inject('sidebarStore')
@observer
class LinkView extends React.Component<ILinkViewProps, ILinkViewState> {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    public componentDidMount() {
        if (this.props.sidebarStore) {
            // TODO: fetch GraphSQL with linkId
            // const linkId = this.props.sidebarStore!.openLinkId;
        }
    }

    public componentWillUnmount() {
        this.props.sidebarStore!.setOpenLinkId(null);
    }

    public onChange = () => {
        // console.log('asd');
    }

    public doNothing = () => {
        // console.log('klik');
    }

    public render(): any {
        return (
        <div className={s.linkView}>
            <SidebarViewHeader
                header='Reitin 1016 linkki'
            />
            <MultiTabInput />
            <div className={classnames(s.flexInnerColumn, s.subTopic)}>
                REITIN SUUNNAN TIEDOT
            </div>
            <div className={s.flexRow}>
                <div className={s.flexInnerColumn}>
                    <div className={s.flexInnerRow}>
                        <InputContainer
                            label='REITTITUNNUS'
                            placeholder='1016'
                        />
                        <InputContainer
                            label='SUUNTA'
                            placeholder='Suunta 1'
                        />
                    </div>
                    <div className={s.flexInnerRow}>
                        <InputContainer
                            label='VOIM. AST'
                            placeholder='01.09.2017'
                        />
                        <InputContainer
                            label='VIIM. VOIM'
                            placeholder='31.12.2050'
                        />
                    </div>
                    <InputContainer
                        label='NIMI'
                        placeholder='Rautatientori - Korkeasaari'
                        className={s.largeInput}
                    />
                </div>
                <InputContainer
                    label='TIEDOT'
                    placeholder=''
                    className={s.textArea}
                />
            </div>
            <div className={classnames(s.flexInnerColumn, s.subTopic)}>
                REITIN LINKKI
            </div>
            <div className={s.flexInnerRow}>
                <div className={s.inputContainer}>
                    <div className={classnames(s.subTopic)}>
                        ALKU
                    </div>
                    <div className={s.inputRowContainer}>
                        <input
                            placeholder='1020112'
                            type='text'
                        />
                        <div>
                            <Dropdown
                                onChange={this.onChange}
                                items={['P', 'P1', 'P2']}
                                selected={'P'}
                            />
                        </div>
                        <input
                            placeholder='Rautatientori'
                            type='text'
                        />
                    </div>
                </div>
            </div>
            <div className={s.flexInnerRow}>
                <div className={s.inputContainer}>
                    <div className={classnames(s.subTopic)}>
                        LOPPU
                    </div>
                    <div className={s.inputRowContainer}>
                        <input
                            placeholder='1020126'
                            type='text'
                        />
                        <div>
                            <Dropdown
                                onChange={this.onChange}
                                items={['P', 'P1', 'P2']}
                                selected={'P'}
                            />
                        </div>
                        <input
                            placeholder='Rautatientori'
                            type='text'
                        />
                    </div>
                </div>
            </div>
            <div className={s.flexInnerRow}>
                <div className={s.inputContainer}>
                    <div className={classnames(s.subTopic)}>
                        KUTSU-/JÄTTÖ-/OTTOP
                    </div>
                    <div>
                        <Dropdown
                            onChange={this.onChange}
                            items={['0 - Ei', '1 - Ei', '2 - Ei']}
                            selected={'0 - Ei'}
                        />
                    </div>
                </div>
                <div className={s.inputContainer}>
                    <div className={classnames(s.subTopic)}>
                        AJANTASAUSPYSÄKKI
                    </div>
                    <div>
                        <Dropdown
                            onChange={this.onChange}
                            items={['Kyl', 'Salee', 'Ehk']}
                            selected={'Ei'}
                        />
                    </div>
                </div>
                <div className={s.inputContainer}>
                    <div className={classnames(s.subTopic)}>
                        VÄLIPISTEAIKAPYSÄKKI
                    </div>
                    <div>
                        <Dropdown
                            onChange={this.onChange}
                            items={['Ei']}
                            selected={'Kyllä'}
                        />
                    </div>
                </div>
            </div>
            <div className={s.flexInnerRow}>
                <InputContainer
                    label='SUUNTA'
                    placeholder='Suunta 1'
                />
                <InputContainer
                    label='OS. NRO'
                    placeholder='2 B'
                />
                <InputContainer
                    label='LINKIN PITUUS'
                    placeholder='2'
                />
            </div>
            <div className={s.flexInnerRow}>
                <div className={s.flexColumn}>
                    <InputContainer
                        label='KATU'
                        placeholder='Rautatientori'
                        className={s.mediumInput}
                    />
                    <div className={s.inputContainer}>
                        <div className={classnames(s.subTopic)}>
                            ALKUSOLMUN SARAKE NRO
                        </div>
                        <div className={s.flexInnerRow}>
                            <input
                                placeholder='1'
                                type='text'
                                className={s.smallInput}
                            />
                            <Checkbox
                                checked={false}
                                text={'Ohitusaika kirjat-aikat.'}
                                onClick={this.onChange}
                            />
                        </div>
                        <div className={s.flexInnerRow}>
                            <input
                                placeholder='1'
                                type='text'
                                className={s.smallInput}
                            />
                            <Checkbox
                                checked={false}
                                text={'Ohitusaika kirjat-aikat.'}
                                onClick={this.onChange}
                            />
                        </div>
                    </div>
                    <div className={s.inputContainer}>
                        <div className={s.inputContainer}>
                            <div className={classnames(s.subTopic)}>
                                ALKUSOLMUN SÄDE JA PAIKKA
                            </div>
                            <div className={s.flexInnerRow}>
                                <input
                                    placeholder=''
                                    type='text'
                                    className={s.mediumSmallInput}
                                />
                                <input
                                    placeholder='1RT'
                                    type='text'
                                    className={s.mediumSmallInput}
                                />
                            </div>
                        </div>
                        <div className={s.inputContainer}>
                            <div className={classnames(s.subTopic)}>
                                ALKUSOLMU PAIKKANA
                            </div>
                            <Dropdown
                                onChange={this.onChange}
                                items={['Ei']}
                                selected={'Kyllä'}
                            />
                        </div>

                    </div>
                </div>
                <div className={s.flexColumn}>
                    <InputContainer
                        label='KATUOSAN OS. NRO'
                        placeholder='1'
                        className={s.mediumInput}
                    />
                    <div className={s.inputContainer}>
                        <div className={classnames(s.subTopic)}>
                            VIIM. LINKIN LOPPUSOLMU SARAKE NRO
                        </div>
                        <div className={s.flexInnerRow}>
                            <input
                                placeholder=''
                                type='text'
                                className={s.smallInput}
                            />
                            <Checkbox
                                checked={false}
                                text={'Ohitusaika kirjat-aikat.'}
                                onClick={this.onChange}
                            />
                        </div>
                        <div className={s.flexInnerRow}>
                            <input
                                placeholder=''
                                type='text'
                                className={s.smallInput}
                            />
                            <Checkbox
                                checked={false}
                                text={'Ohitusaika kirjat-aikat.'}
                                onClick={this.onChange}
                            />
                        </div>
                    </div>
                    <div className={s.inputContainer}>
                        <div className={classnames(s.subTopic)}>
                            LOPPUSOLMUN SÄDE JA PAIKKA
                        </div>
                        <div className={s.flexInnerRow}>
                            <input
                                placeholder=''
                                type='text'
                                className={s.mediumSmallInput}
                            />
                            <input
                                placeholder='1RT'
                                type='text'
                                className={s.mediumSmallInput}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={s.flexInnerRow}>
                <InputContainer
                    label='PÄIVITTÄJÄ'
                    placeholder='Vuori Tuomas'
                    className={s.mediumInput}
                />
                <InputContainer
                    label='PÄIVITYSPVM'
                    placeholder='23.08.2017'
                    className={s.mediumInput}
                />
            </div>

            <div className={s.flexRow}>
                <Button
                    onClick={this.doNothing}
                    type={ButtonType.PRIMARY}
                    text={'Seuraava'}
                />
                <Button
                    onClick={this.doNothing}
                    type={ButtonType.PRIMARY}
                    text={'Edellinen'}
                />
                <Button
                    onClick={this.doNothing}
                    type={ButtonType.PRIMARY}
                    text={'Alkusolmu'}
                />
                <Button
                    onClick={this.doNothing}
                    type={ButtonType.PRIMARY}
                    text={'Loppusolmu'}
                />
            </div>
        </div>
        );
    }
}
export default LinkView;
