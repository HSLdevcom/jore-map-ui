import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { SidebarStore } from '../stores/sidebarStore';
import * as s from './nodeWindow.scss';
import { Button, Checkbox, ToggleButton } from './controls';
import ButtonType from '../enums/buttonType';
import TransitType from '../enums/transitType';
import classnames from 'classnames';

interface INodeWindowState {
    targetCheckboxToggles: any;
}

interface INodeWindowProps {
    sidebarStore?: SidebarStore;
}

@inject('sidebarStore')
@observer
class NodeWindow extends React.Component
<INodeWindowProps, INodeWindowState> {
    constructor(props: any) {
        super(props);
        this.state = {
            targetCheckboxToggles: {
                kadut: true, // Todo: get these from props
                solmut: true,
                linkit: true,
                alueet: false,
            },
        };
    }

    public componentDidMount() {
        if (this.props.sidebarStore) {
            // TODO: fetch GraphSQL with nodeId
            // const nodeId = this.props.sidebarStore!.openedNodeId;
        }
    }

    private toggleStopInUse() {
        // Todo
    }

    private targetCheckboxToggle = (type: string) => {
        const newToggleState: object = this.state.targetCheckboxToggles;
        newToggleState[type] = !this.state.targetCheckboxToggles[type];
        this.setState({
            targetCheckboxToggles: newToggleState,
        });
    }

    private doNothing() {
        // Empty
    }

    public render(): any {
        return (
        <div className={s.nodeWindow}>
            <div className={s.topic}>Karttakohde</div>
            <div
                className={classnames(
                    s.rowR,
                    s.stopInUseRow,
                )}
            >
                <div className={s.rowElement}>
                    Pysäkki käytössä
                </div>
                <ToggleButton
                    onClick={this.toggleStopInUse}
                    value={true}
                    type={TransitType.BUS}
                />
            </div>
            <div
                className={classnames(
                    s.rowC,
                    s.targetsRow,
                )}
            >
                <div className={s.innerRowC}>
                    Käsiteltävät kohteet
                </div>
                <div className={s.innerRowR}>
                    <div className={s.rowElement}>
                        <Checkbox
                            onClick={this.targetCheckboxToggle.bind(this, 'kadut')}
                            checked={this.state.targetCheckboxToggles.kadut}
                            text={'Kadut'}
                        />
                    </div>
                    <div className={s.rowElement}>
                        <Checkbox
                            onClick={this.targetCheckboxToggle.bind(this, 'solmut')}
                            checked={this.state.targetCheckboxToggles.solmut}
                            text={'Solmut'}
                        />
                    </div>
                    <div className={s.rowElement}>
                        <Checkbox
                            onClick={this.targetCheckboxToggle.bind(this, 'linkit')}
                            checked={this.state.targetCheckboxToggles.linkit}
                            text={'Linkit'}
                        />
                    </div>
                    <div className={s.rowElement}>
                        <Checkbox
                            onClick={this.targetCheckboxToggle.bind(this, 'alueet')}
                            checked={this.state.targetCheckboxToggles.alueet}
                            text={'Alueet'}
                        />
                    </div>
                </div>
            </div>
            <div className={s.rowR}>
                Sijainti: (2555744, 6675294)
            </div>
            <div className={s.innerRowR}>
                <div className={s.innerRowR}>
                    Karttatietolähde
                    X/1420004
                </div>
                <div
                    className={classnames(
                        s.innerRowC,
                        s.informationContainer,
                    )}
                >
                    <div className={s.informationSource}>Tiedon lähde: pisteet</div>
                    <div className={s.innerRowC}>
                        Shape:
                    </div>
                </div>
            </div>
            <div className={s.innerRowR}>
                <div className={s.innerRowC}>
                    9 tietolähdettä löytyi.
                    <div className={s.informationField}>
                        <div className={s.item}>Info = X/1420004</div>
                        <div className={s.item}>Nopeudet = 34km/h / 28km/h</div>
                        <div className={s.item}>Pituudet = 149m / 7376m</div>
                        <div className={s.item}>Ajoajat = 16s / 15min 42s</div>
                        <div className={s.item}>Verkko = 1</div>
                        <div className={s.item}>Loppusolmu = 1420113</div>
                        <div className={s.item}>Tyyppi = X</div>
                        <div className={s.item}>Y = 2555744</div>
                        <div className={s.item}>X = 6675295</div>
                        <div className={s.item}>Soltunnus = 1420004</div>
                        <div className={s.item}>Nimi = Kulosaarentie-Kulosaarentie</div>
                    </div>
                </div>
                <div
                    className={classnames(
                    s.buttonContainer,
                    s.innerRowC,
                    )}
                >
                    <Button
                        onClick={this.doNothing}
                        type={ButtonType.PRIMARY}
                        text={'Avaa kohde'}
                    />
                    <Button
                        onClick={this.doNothing}
                        type={ButtonType.PRIMARY}
                        text={'Valitse linkki reittisuunnan alkuun'}
                    />
                    <Button
                        onClick={this.doNothing}
                        type={ButtonType.PRIMARY}
                        text={'Valitse linkki reittisuunnan väliin'}
                    />
                    <Button
                        onClick={this.doNothing}
                        type={ButtonType.PRIMARY}
                        text={'Valitse linkki reittisuunnan loppuun'}
                    />
                    <Button
                        onClick={this.doNothing}
                        type={ButtonType.PRIMARY}
                        text={'Poista linkki'}
                    />
                    <Button
                        onClick={this.doNothing}
                        type={ButtonType.PRIMARY}
                        text={'Käsittele muotopisteitä'}
                    />
                </div>
            </div>
        </div>
        );
    }
}
export default NodeWindow;
