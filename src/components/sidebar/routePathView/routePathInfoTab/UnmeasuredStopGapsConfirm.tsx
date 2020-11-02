import { inject, observer } from 'mobx-react';
import React from 'react';
import * as s from './unmeasuredStopGapsConfirm.scss';

interface IUnmeasuredStopGapsConfirmProps {
    unmeasuredStopGapList: string[][];
    routePathLength: number;
    calculatedRoutePathLength: number;
}

const UnmeasuredStopGapsConfirm = inject()(
    observer((props: IUnmeasuredStopGapsConfirmProps) => {
        return (
            <div className={s.unmeasuredStopGapPrompt} data-cy='unmeasuredStopGapPrompt'>
                <div>Haluatko varmasti edetä reitinsuunnan tallentamiseen?</div>
                {props.routePathLength !== props.calculatedRoutePathLength && (
                    <div>
                        Reitinsuunnan tämänhetkinen pituus ei ole sama kuin pysäkkivälien ja
                        linkkien pituuksista muodostettu summa.
                    </div>
                )}

                {props.unmeasuredStopGapList.length > 0 && (
                    <>
                        <div className={s.unmeasuredStopGapsHeader}>
                            Reitinsuunnan laskettu pituus sisältää mittaamattomia pysäkkivälejä:
                        </div>
                        {props.unmeasuredStopGapList.map(
                            (unmeasuredStopGap: string[], index: number) => {
                                return (
                                    <div key={`stopGap-${index}`}>
                                        {unmeasuredStopGap[0]} - {unmeasuredStopGap[1]}
                                    </div>
                                );
                            }
                        )}
                    </>
                )}
            </div>
        );
    })
);

export default UnmeasuredStopGapsConfirm;
