import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { SidebarStore } from '../../stores/sidebarStore';
import { Button, Dropdown, ToggleButton } from '../controls';
import ButtonType from '../../enums/buttonType';
import TransitType from '../../enums/transitType';
import SidebarViewHeader from './SidebarViewHeader';
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
            <SidebarViewHeader
                header='Karttakohde'
                closeSidebarView={this.closeNodeView}
            />
            <div
                className={classnames(
                    s.flexRow,
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
            <div className={s.flexRow}>
                Sijainti: (2555744, 6675294)
            </div>
            <div className={s.flexInnerRow}>
                <div className={s.flexInnerColumn}>
                    <div>Karttatietolähde</div>
                    <Dropdown
                        onChange={this.onMapInformationSourceChange}
                        items={this.state.mapInformationSource.items}
                        selected={this.state.mapInformationSource.selected}
                    />
                </div>
            </div>
            <div className={s.flexInnerRow}>
                <div className={s.flexInnerColumn}>
                    <div className={s.informationSource}>Tiedon lähde: pisteet</div>
                    <div className={s.flexInnerRow}>
                        Shape:
                    </div>
                </div>
            </div>
            <div className={s.flexInnerRow}>
                <div className={s.flexInnerColumn}>
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
            <div className={s.flexInnerRow}>
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
