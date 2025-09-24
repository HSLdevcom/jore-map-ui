// Keep lineHeader original startDate in memory and use it as part of the primary key
interface ILineHeaderPrimaryKey {
  lineId: string
  originalStartDate?: Date // Can be null because if lineHeader is new, it has no originalStartDate
}

interface ILineHeader extends ILineHeaderPrimaryKey {
  startDate: Date
  endDate: Date
  lineNameFi: string
  lineShortNameFi?: string
  lineNameSw?: string
  lineShortNameSw?: string
  lineStartPlace1Fi?: string
  lineStartPlace1Sw?: string
  lineStartPlace2Fi?: string
  lineStartPlace2Sw?: string
  modifiedBy?: string
  modifiedOn?: Date
}

export default ILineHeader

export { ILineHeaderPrimaryKey }
