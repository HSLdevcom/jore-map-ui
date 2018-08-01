import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import { IRoute } from '../../models';
import ToggleButton from '../controls/ToggleButton';
import LineHelper from '../../util/lineHelper';

interface ILineEditViewState {
    type: string;
}

interface ILineEditViewProps {
    routeStore?: RouteStore;
}

@inject('routeStore')
@observer
class LineEditView extends React.Component<ILineEditViewProps, ILineEditViewState> {

    public render(): any {
        return (
        <span className='editable-line-wrapper'>
          {this.props.routeStore!.openRoutes.map((route: IRoute) => {
              {
                  console.log(toJS(route));
              }
              return (
                <div className='editable-line' key={route.lineId}>
                  <span className='line-wrapper'>
                      {LineHelper.getTransitIcon(route.line.transitType, false)}
                    <span className={'line-number-' + route.line.transitType}>
                        {route.line.lineNumber}
                    </span>
                    {route.line.lineName}
                  </span>
                  <div className='direction-toggle'>
                    <span className='direction-toggle-title'>suunta 1 </span>
                    <ToggleButton type={route.line.transitType}/>
                  </div>
                  <div className='checkbox-container'>
                    <input
                      type='checkbox'
                      className='checkbox-input'
                      checked={false}
                    />
                    Kopioi reitti toiseen suuntaan
                  </div>
                </div>
              );
          })
          }
          <div className='editableLine-input-container'>
            <label className='editableLine-input-container-title'>
                HAE TOINEN LINJA TARKASTELUUN
            </label>
            <input
              placeholder='Hae reitti'
              className='editableLine-input'
              type='text'
            />
          </div>
          <div className='editableLine-input-container'>
            <span className='editableLine-input-container-title'>TARKASTELUPÄIVÄ</span>
            <input
              placeholder='25.8.2017'
              className='editableLine-input'
              type='text'
            />
          </div>
          <div className='editableLine-graph'>
            <div className='container'>
            <label className='editableLine-input-container-title'>VERKKO</label>
            <TransitToggleButtonBar filters={[]} />
            <div className='checkbox-container'>
              <input
                type='checkbox'
                className='checkbox-input'
                checked={false}
              />
              Hae alueen linkit
            </div>
            <div className='checkbox-container'>
              <input
                type='checkbox'
                className='checkbox-input'
                checked={false}
              />
              Hae alueen solmut
            </div>
            </div>
          </div>
        </span>
        );
    }
}

export default LineEditView;
