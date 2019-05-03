import * as React from 'react';
import * as s from './splitConfirmContent.scss';

interface ISplitConfirmContentProps {
    message: string;
    itemList: { label: string; value: string }[];
}

const SplitConfirmContent = (props: ISplitConfirmContentProps) => (
    <div className={s.splitConfirmContentView}>
        <div className={s.confirmHeader}>{props.message}</div>
        {props.itemList.map((item, index) => (
            <div key={index} className={s.pair}>
                <div className={s.label}>{item.label}</div>
                <div>{item.value}</div>
            </div>
        ))}
        <div className={s.note}>(Muutoksia ei vielä tallenneta)</div>
    </div>
);

export default SplitConfirmContent;
