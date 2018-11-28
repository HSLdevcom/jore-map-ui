import * as React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import ButtonType from '~/enums/buttonType';
import TransitType from '~/enums/transitType';
import { IRoutePathLink } from '~/models';
import RoutePathLinkService from '~/services/routePathLinkService';
import { Checkbox, Dropdown, Button, TransitToggleButtonBar } from '../../controls';
import InputContainer from '../InputContainer';
import MultiTabTextarea from './MultiTabTextarea';
import Loader from '../../shared/loader/Loader';
import ViewHeader from '../ViewHeader';
import * as s from './linkView.scss';

interface ILinkViewState {
    selectedTransitType: TransitType;
    routePathLink: IRoutePathLink | null;
    isLoading: boolean;
}

interface ILinkViewProps {
    match?: match<any>;
}

@observer
class LinkView extends React.Component<ILinkViewProps, ILinkViewState> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectedTransitType: TransitType.BUS,
            routePathLink: null,
            isLoading: true,
        };
    }

    public componentDidMount() {
        const routeLinkId = this.props.match!.params.id;
        if (routeLinkId) {
            this.fetchRoutePathLink(routeLinkId);
        }
    }

    public componentWillReceiveProps(props: any) {
        const routeLinkId = props.match!.params.id;
        if (routeLinkId) {
            this.fetchRoutePathLink(routeLinkId);
        }
    }

    private async fetchRoutePathLink(id: string) {
        const routePathLinkId = parseInt(id, 10);

        this.setState({ isLoading: true });

        const routePathLink =
            await RoutePathLinkService.fetchRoutePathLink(routePathLinkId);
        if (routePathLink) {
            this.setState({ routePathLink });
        }
        this.setState({ isLoading: false });
    }

    private toggleSelectedTransitType = (selectedTransitType: TransitType): void => {
        this.setState({ selectedTransitType });
    }

    private getFilters = () => {
        return [this.state.selectedTransitType];
    }

    public toggleEditing = () => {
    }

    // TODO
    public onChange = () => {
    }

    public render(): any {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.linkView, s.form)}>
                    <Loader />
                </div>
            );
        }

        return (
        <div className={classnames(s.linkView, s.form)}>
            <ViewHeader
                header={`Reitinlinkki ${this.state.routePathLink!.id}`}
            />
            <div className={s.topic}>
                REITIN SUUNNAN TIEDOT
            </div>
            <div className={classnames(s.flexRow, s.formSection)}>
                <div className={s.column}>
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
                    />
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRow}>
                        <div className={s.formItem}>
                            <div className={s.inputLabel}>
                                TIEDOT
                            </div>
                            <input
                                placeholder=''
                                type='text'
                                className={s.textArea}
                                readOnly={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <div className={s.topic}>
                        REITIN LINKKI
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRowFlexEnd}>
                        <InputContainer
                            label='ALKU'
                            placeholder={this.state.routePathLink!.startNode.id}
                        />
                        <Dropdown
                            onChange={this.onChange}
                            items={['P', 'P1', 'P2']}
                            selected={'P'}
                        />
                        <InputContainer
                            label=''
                            placeholder='Rautatientori'
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRowFlexEnd}>
                        <InputContainer
                            label='LOPPU'
                            placeholder={this.state.routePathLink!.endNode.id}
                        />
                        <Dropdown
                            onChange={this.onChange}
                            items={['P', 'P1', 'P2']}
                            selected={'P'}
                        />
                        <InputContainer
                            label=''
                            placeholder='Rautatientori'
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <Dropdown
                        label='KUTSU-/JÄTTÖ-/OTTOP'
                        onChange={this.onChange}
                        items={['0 - Ei', '1 - Ei', '2 - Ei']}
                        selected={'0 - Ei'}
                    />
                    <Dropdown
                        label='AJANTASAUSPYSÄKKI'
                        onChange={this.onChange}
                        items={['Kyllä', 'Ei']}
                        selected={'Ei'}
                    />
                    <Dropdown
                        label='VÄLIPISTEAIKAPYSÄKKI'
                        onChange={this.onChange}
                        items={['Kyllä', 'Ei']}
                        selected={'Kyllä'}
                    />
                </div>
                <div className={s.flexRow}>
                    <div className={s.formItem}>
                        <div className={s.inputLabel}>
                            VERKKO
                        </div>
                        <div className={s.transitButtonBar}>
                            <TransitToggleButtonBar
                                toggleSelectedTransitType={this.toggleSelectedTransitType}
                                selectedTransitTypes={this.getFilters()}
                            />
                        </div>
                    </div>
                </div>
                <div className={s.flexRow}>
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
                <div className={s.flexRow}>
                    <InputContainer
                        label='KATU'
                        placeholder='Rautatientori'
                    />
                    <InputContainer
                        label='KATUOSAN OS. NRO'
                        placeholder='1'
                    />
                </div>
                <div className={s.flexRow}>
                    <div className={s.inputLabel}>
                        ALKUSOLMUN SARAKE NRO
                    </div>
                    <div className={s.inputLabel}>
                        VIIM. LINKIN LOPPUSOLMU SARAKE NRO
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRow}>
                        <input
                            placeholder='1'
                            type='text'
                            className={s.smallInput}
                        />
                        <Checkbox
                            checked={false}
                            text={'Ohitusaika kirja-aikat.'}
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
                            text={'Ohitusaika kirja-aikat.'}
                            onClick={this.onChange}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexInnerRow}>
                        <input
                            placeholder='1'
                            type='text'
                            className={s.smallInput}
                        />
                        <Checkbox
                            checked={false}
                            text={'Ohitusaika kirja-aikat.'}
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
                            text={'Ohitusaika kirja-aikat.'}
                            onClick={this.onChange}
                        />
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.formItem}>
                        <div className={s.inputLabel}>
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
                    <div className={s.formItem}>
                        <div className={s.inputLabel}>
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
                <div className={s.flexRow}>
                    <div className={s.flexGrow}>
                        <Dropdown
                            label='ALKUSOLMU PAIKKANA'
                            onChange={this.onChange}
                            items={['Kyllä', 'Ei']}
                            selected={'Kyllä'}
                        />
                    </div>
                    <div className={s.flexFiller} />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='PÄIVITTÄJÄ'
                        placeholder='Vuori Tuomas'
                    />
                    <InputContainer
                        label='PÄIVITYSPVM'
                        placeholder='23.08.2017'
                    />
                </div>
            </div>
            <MultiTabTextarea
                tabs={['Tariffialueet', 'Määränpäät', 'Ajoajat']}
            />
            <div className={s.buttonBar}>
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                    text={'Seuraava'}
                />
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                    text={'Edellinen'}
                />
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                    text={'Alkusolmu'}
                />
                <Button
                    onClick={this.onChange}
                    type={ButtonType.ROUND}
                    text={'Loppusolmu'}
                />
            </div>
        </div>
        );
    }
}
export default LinkView;
