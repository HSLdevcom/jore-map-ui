import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { SidebarStore } from '../../stores/sidebarStore';
import { Button, Dropdown, ToggleButton } from '../controls';
import ButtonType from '../../enums/buttonType';
import TransitType from '../../enums/transitType';
import * as s from './nodeView.scss';

interface IMapInformationSource {
    selected: string;
    items: string[];
}

interface INodeViewState {
    mapInformationSource: IMapInformationSource;
}

interface INodeViewProps {
    sidebarStore?: SidebarStore;
}

@inject('sidebarStore')
@observer
class NodeView extends React.Component
<INodeViewProps, INodeViewState> {
    constructor(props: any) {
        super(props);
        this.state = {
            mapInformationSource: {
                selected: 'X/1420004',
                items: ['X/1420001', 'X/1420002', 'X/1420003', 'X/1420004', 'X/1420005'],
            },
        };
    }

    public componentDidMount() {
        if (this.props.sidebarStore) {
            // TODO: fetch GraphSQL with nodeId
            // const nodeId = this.props.sidebarStore!.openNodeId;
        }
    }

    private closeNodeView = () => {
        this.props.sidebarStore!.setOpenNodeId(null);
    }

    private toggleStopInUse() {
        // Todo
    }

    private onMapInformationSourceChange = (selectedItem: string) => {
        this.setState({
            mapInformationSource: {
                ...this.state.mapInformationSource,
                selected: selectedItem,
            },
        });
    }

    private doNothing() {
        // Empty
    }

    public render(): any {
        return (
        <div className={s.nodeView}>
            <div className={s.header}>
                <div className={s.topic}>Karttakohde</div>
                <div
                    className={s.closeButton}
                    onClick={this.closeNodeView}
                />
            </div>
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
                    color={'#007ac9'}
                />
            </div>
            <div className={s.rowR}>
                Sijainti: (2555744, 6675294)
            </div>
            <div className={s.innerRowR}>
                <div className={s.innerRowC}>
                    <div>Karttatietolähde</div>
                    <Dropdown
                        onChange={this.onMapInformationSourceChange}
                        items={this.state.mapInformationSource.items}
                        selected={this.state.mapInformationSource.selected}
                    />
                </div>
            </div>
            <div className={s.innerRowR}>
                <div className={s.innerRowC}>
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
            </div>
            <div className={s.innerRowR}>
                <Button
                    onClick={this.doNothing}
                    type={ButtonType.PRIMARY}
                    text={'Poista linkki'}
                />
            </div>
        </div>
        );
    }
}
export default NodeView;
