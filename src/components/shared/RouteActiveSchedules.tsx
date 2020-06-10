import _ from 'lodash';
import React from 'react';
import ISchedule from '~/models/ISchedule';
import { isCurrentDateWithinTimeSpan, toDateString } from '~/utils/dateUtils';
import * as s from './routeActiveSchedules.scss';

interface IRouteActiveSchedulesProps {
    activeSchedules: ISchedule[];
    header?: string;
    confirmMessage?: string;
}

class RouteActiveSchedules extends React.Component<IRouteActiveSchedulesProps> {
    render() {
        const { header, activeSchedules, confirmMessage } = this.props;
        const currentScheduleIndex = activeSchedules.findIndex((schedule: ISchedule) => {
            return isCurrentDateWithinTimeSpan(schedule.startDate, schedule.endDate);
        });
        let currentSchedule: ISchedule | null = null;
        const futureSchedules: ISchedule[] = _.cloneDeep(activeSchedules);
        if (currentScheduleIndex >= 0) {
            currentSchedule = activeSchedules[currentScheduleIndex];
            futureSchedules.splice(currentScheduleIndex, 1);
            futureSchedules.sort((s1: ISchedule, s2: ISchedule) => {
                return new Date(s1.startDate).getTime() < new Date(s2.startDate).getTime() ? -1 : 1;
            });
        }
        return (
            <div className={s.routeActiveSchedules}>
                {confirmMessage && <div>{confirmMessage}</div>}
                {header && (
                    <div className={s.subSection}>
                        <div className={s.header}>Reitti {header}</div>
                    </div>
                )}
                {currentSchedule && (
                    <div className={s.subSection}>
                        <div className={s.header}>Voimassa oleva aikataulu</div>
                        <div>
                            {toDateString(currentSchedule.startDate)} -{' '}
                            {toDateString(currentSchedule.endDate)}
                        </div>
                    </div>
                )}
                {futureSchedules.length > 0 && (
                    <div className={s.subSection}>
                        <div className={s.header}>Voimaanastuvat aikataulut</div>
                        {futureSchedules.map((futureSchedule: ISchedule, index: number) => {
                            return (
                                <div key={`futureSchedule-${index}`}>
                                    {toDateString(futureSchedule.startDate)} -{' '}
                                    {toDateString(futureSchedule.endDate)}
                                </div>
                            );
                        })}
                    </div>
                )}
                {activeSchedules.length === 0 && (
                    <div>Reitille ei löytynyt voimassa olevia tai voimaanastuvia aikatauluja.</div>
                )}
            </div>
        );
    }
}

export default RouteActiveSchedules;
