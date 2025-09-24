import _ from 'lodash'
import React from 'react'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { IRoutePath } from '~/models'
import ISchedule from '~/models/ISchedule'
import { isCurrentDateWithinTimeSpan, toDateString } from '~/utils/dateUtils'
import * as s from './routeActiveSchedules.scss'

interface IRouteActiveSchedulesProps {
  routePaths: IRoutePath[]
  activeSchedules: ISchedule[]
  header?: string
  confirmMessage?: string
}

interface IDateRange {
  startDate: Date
  endDate: Date
}

class RouteActiveSchedules extends React.Component<IRouteActiveSchedulesProps> {
  private renderScheduleRow = ({
    schedule,
    dateRangesDirection1,
    dateRangesDirection2,
  }: {
    schedule: ISchedule
    dateRangesDirection1: IDateRange[]
    dateRangesDirection2: IDateRange[]
  }) => {
    const uncoveredDirections = this.getRoutePathDirectionsOfUncoveredSchedule({
      schedule,
      dateRangesDirection1,
      dateRangesDirection2,
    })
    const isScheduleCovered = uncoveredDirections.length === 0
    return (
      <div className={s.scheduleRow}>
        <div className={s.indicator}>
          {isScheduleCovered ? (
            <FaCheckCircle className={s.coveredSchedule} />
          ) : (
            <FaExclamationCircle className={s.uncoveredSchedule} />
          )}
        </div>
        <div className={s.textContainer}>
          {toDateString(schedule.startDate)} - {toDateString(schedule.endDate)}
          {isScheduleCovered ? (
            <div className={s.coveredSchedule}>Aikataululle löytyy reitinsuunta</div>
          ) : (
            <div className={s.uncoveredSchedule}>
              Aikataulun voimassaoloaika ei peity reitinsuuntien suunnilla:{' '}
              {uncoveredDirections.join(', ')}
            </div>
          )}
        </div>
      </div>
    )
  }

  private getCoherentRoutePathDateRanges = ({
    routePaths,
  }: {
    routePaths: IRoutePath[]
  }): IDateRange[] => {
    // Expects that routePaths are sorted by startDate from newest ones to older ones and that routePath dates don't overlap
    const dateRanges: IDateRange[] = []
    let currentDateRange: IDateRange | null = null
    routePaths.forEach((routePath, index) => {
      if (!currentDateRange) {
        currentDateRange = {
          startDate: routePath.startDate,
          endDate: routePath.endDate,
        }
        return
      }
      const currentEndDatePlusOne = _.cloneDeep(routePath.endDate)
      currentEndDatePlusOne.setDate(currentEndDatePlusOne.getDate() + 1)
      // Check if current routePath date range is coherent with currentDateRange
      if (currentEndDatePlusOne.getTime() === currentDateRange.startDate.getTime()) {
        currentDateRange.startDate = routePath.startDate
      } else {
        dateRanges.push(currentDateRange)
        currentDateRange = {
          startDate: routePath.startDate,
          endDate: routePath.endDate,
        }
      }
      if (index === routePaths.length - 1) {
        dateRanges.push(currentDateRange!)
      }
    })
    return dateRanges
  }

  private getRoutePathDirectionsOfUncoveredSchedule = ({
    schedule,
    dateRangesDirection1,
    dateRangesDirection2,
  }: {
    schedule: ISchedule
    dateRangesDirection1: IDateRange[]
    dateRangesDirection2: IDateRange[]
  }): string[] => {
    const uncoveredDirections: string[] = []

    const isDirectionCovered = (dateRanges: IDateRange[]) => {
      return dateRanges.some((dateRange: IDateRange) => {
        // Is schedule inside of a dateRange
        return (
          schedule.startDate.getTime() >= dateRange.startDate.getTime() &&
          schedule.endDate.getTime() <= dateRange.endDate.getTime()
        )
      })
    }
    if (!isDirectionCovered(dateRangesDirection1)) {
      uncoveredDirections.push('1')
    }
    if (!isDirectionCovered(dateRangesDirection2)) {
      uncoveredDirections.push('2')
    }
    return uncoveredDirections
  }

  render() {
    const { header, activeSchedules, confirmMessage, routePaths } = this.props
    const currentScheduleIndex = activeSchedules.findIndex((schedule: ISchedule) => {
      return isCurrentDateWithinTimeSpan(schedule.startDate, schedule.endDate)
    })
    let currentSchedule: ISchedule | null = null

    const futureSchedules: ISchedule[] = _.cloneDeep(activeSchedules)
    if (currentScheduleIndex >= 0) {
      currentSchedule = activeSchedules[currentScheduleIndex]
      futureSchedules.splice(currentScheduleIndex, 1)
      futureSchedules.sort((s1: ISchedule, s2: ISchedule) => {
        return new Date(s1.startDate).getTime() < new Date(s2.startDate).getTime() ? -1 : 1
      })
    }

    const routePathsDirection1 = routePaths.filter((rp) => rp.direction === '1')
    const routePathsDirection2 = routePaths.filter((rp) => rp.direction === '2')
    const dateRangesDirection1 = this.getCoherentRoutePathDateRanges({
      routePaths: routePathsDirection1,
    })
    const dateRangesDirection2 = this.getCoherentRoutePathDateRanges({
      routePaths: routePathsDirection2,
    })
    return (
      <div className={s.routeActiveSchedules}>
        {confirmMessage && <div className={s.confirmMessage}>{confirmMessage}</div>}
        {header && (
          <div className={s.subSection}>
            <div className={s.header}>Reitti {header}</div>
          </div>
        )}
        {currentSchedule && (
          <div className={s.subSection}>
            <div className={s.header}>Voimassa oleva aikataulu</div>
            {this.renderScheduleRow({
              dateRangesDirection1,
              dateRangesDirection2,
              schedule: currentSchedule,
            })}
          </div>
        )}
        {futureSchedules.length > 0 && (
          <div className={s.subSection}>
            <div className={s.header}>Voimaanastuvat aikataulut</div>
            {futureSchedules.map((futureSchedule: ISchedule, index: number) => {
              return (
                <div className={s.futureScheduleRow} key={`futureSchedule-${index}`}>
                  {this.renderScheduleRow({
                    dateRangesDirection1,
                    dateRangesDirection2,
                    schedule: futureSchedule,
                  })}
                </div>
              )
            })}
          </div>
        )}
        {activeSchedules.length === 0 && (
          <div className={s.noActiveSchedulesMessage}>
            Reitille ei löytynyt voimassa olevia tai voimaanastuvia aikatauluja.
          </div>
        )}
      </div>
    )
  }
}

export default RouteActiveSchedules
