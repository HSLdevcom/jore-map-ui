import React from 'react';
import { observer } from 'mobx-react';
import DatePicker from '~/components/controls/DatePicker';
import * as s from './NetworkDateControl.scss';

interface INetworkDateControlProps {
    selectedDate?: Date;
    onChangeDate: (date: Date) => void;
}

const NetworkDateControl = observer(
    (props: INetworkDateControlProps) => (
        <div className={s.networkDateControlView}>
            <label>Tarkkailupäivämäärä</label>
            <DatePicker
                isClearButtonVisible={true}
                value={props.selectedDate}
                onChange={props.onChangeDate}
            />
        </div>
    )
);

export default NetworkDateControl;
