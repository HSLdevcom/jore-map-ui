import {inject, observer} from 'mobx-react'
import * as React from 'react'
import {SidebarStore} from '../../stores/sidebarStore'
import lineHelper from '../../util/lineHelper'

interface ILineItemState {
  type: string
}

interface ILineItemProps {
  sidebarStore?: SidebarStore
  description: string
  lineNumber: string
  transitCode: string
}

@inject('sidebarStore')
@observer
class LineItem extends React.Component<ILineItemProps, ILineItemState> {

    public handleLineSelected = () => {
      this.props.sidebarStore!.setSelectedLine({
        lintunnus: this.props.lineNumber,
        linverkko: this.props.transitCode,
        reitunnus: this.props.description
      })
    }

    public render(): any {
      return (
            <span onClick={this.handleLineSelected} className={'line-wrapper'}>
              {lineHelper.getTransitIcon(lineHelper.convertTransitTypeCodeToTransitType(this.props.transitCode), false)}
              <span className={'line-number-'+this.props.transitCode}>{lineHelper.parseLineNumber(this.props.lineNumber)}</span>
              {this.props.description}
            </span>
      )
    }
}

export default LineItem
