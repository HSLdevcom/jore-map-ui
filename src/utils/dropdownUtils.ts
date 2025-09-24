import { IDropdownItem } from '~/components/controls/Dropdown'
import TransitType from '~/enums/transitType'
import { ISearchLine } from '~/models/ILine'

const createDropdownItemsFromList = (itemList: string[]): IDropdownItem[] => {
  return itemList.map((item: string) => {
    const dropdownItem: IDropdownItem = {
      value: item,
      label: item,
    }
    return dropdownItem
  })
}

const createLineDropdownItems = ({
  lines,
  areInactiveLinesHidden,
  transitTypeFilter,
}: {
  lines: ISearchLine[]
  areInactiveLinesHidden: boolean
  transitTypeFilter?: TransitType
}): IDropdownItem[] => {
  let _lines = lines
  if (transitTypeFilter) {
    _lines = _lines.filter((l) => l.transitType === transitTypeFilter)
  }
  if (areInactiveLinesHidden) {
    _lines = _lines.filter((line) => {
      let isLineActive = false
      line.routes.forEach((route) => {
        if (route.isUsedByRoutePath) {
          isLineActive = true
          return
        }
      })
      return isLineActive
    })
  }
  const lineDropdownItems: IDropdownItem[] = createDropdownItemsFromList(
    _lines.map((searchLine) => searchLine.id)
  )
  return lineDropdownItems
}

export { createDropdownItemsFromList, createLineDropdownItems }
