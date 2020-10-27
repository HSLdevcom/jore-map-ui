import { inject, observer } from 'mobx-react';
import React from 'react';
import * as s from './unmeasuredStopGapsConfirm.scss';

const UnmeasuredStopGapsConfirm = inject()(
    observer(() => {
        return (
            <div className={s.unmeasuredStopGapPrompt} data-cy='unmeasuredStopGapsPrompt'>
                <div>
                    Haluatko varmasti edetä reitinsuunnan tallennukseen? Reitinsuunnan pituuden
                    laskennassa on käytetty mittaamattomia pysäkkivälejä
                </div>
                <div>Mittaamattomat pysäkkivälit: (Lista tulee tähän myöhemmin)</div>
            </div>
        );
    })
);

export default UnmeasuredStopGapsConfirm;
