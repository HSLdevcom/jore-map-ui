import React, { ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import * as s from './NetworkDateControl.scss';

const NetworkDateControl = observer(
    ({ selectDate }: { selectDate: (e: ChangeEvent) => void }) => (
        <div className={s.networkDateControlView}>
            <label>Tarkkailupäivämäärä</label>
            <input
                type='date'
                className={s.networkDateControlInput}
                onChange={selectDate}
            />
        </div>
    )
);

export default NetworkDateControl;
