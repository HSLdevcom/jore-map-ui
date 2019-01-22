import React from 'react';
import { Button, Dropdown } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import { IMapInformationSource } from './NodeView';
import * as s from './nodeView.scss';

interface INodeMockDataProps {
    onMapInformationSourceChange: (selectedItem: string) => void;
    mapInformationSource: IMapInformationSource;
}

const nodeMockData = (props: INodeMockDataProps) => {

    const doNothing = () => {
        // Empty
    };
    return (
        <>
        <div className={s.flexInnerRow}>
            <div className={s.flexInnerColumn}>
                <div>Karttatietolähde</div>
                <Dropdown
                    onChange={props.onMapInformationSourceChange}
                    items={props.mapInformationSource.items}
                    selected={props.mapInformationSource.selected}
                />
            </div>
        </div>
        <div className={s.flexInnerRow}>
            <div className={s.flexInnerColumn}>
                <div className={s.informationSource}>
                    Tiedon lähde: pisteet
                </div>
                <div className={s.flexInnerRow}>
                    Shape:
                </div>
            </div>
        </div>
        <div className={s.flexInnerRow}>
            <div className={s.flexInnerColumn}>
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
                onClick={doNothing}
                type={ButtonType.SQUARE}
            >
            Poista linkki
            </Button>
        </div>
        </>
    );
};

export default nodeMockData;
