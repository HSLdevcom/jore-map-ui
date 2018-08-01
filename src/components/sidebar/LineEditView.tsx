import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import { IDirection, IRoute } from '../../models';
import ToggleButton from '../controls/ToggleButton';
import LineHelper from '../../util/lineHelper';

interface ILineEditViewProps {
    routeStore?: RouteStore;
}

@inject('routeStore')
@observer
class LineEditView extends React.Component<ILineEditViewProps> {
    private directionList(route: IRoute) {
        return route.directions
            .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime())
            .map((direction: IDirection, index: number) => {
                const onClick = () => {
                    this.props.routeStore!.toggleDirectionIsVisible(direction);
                };

                return (
                    <div
                        className='direction-toggle'
                        key={`${direction.directionName}-${index}`}
                    >
                        <span className='direction-toggle-title'>
                            Suunta {direction.direction}
                        </span>
                        <ToggleButton
                            onClick={onClick}
                            value={direction.visible}
                            type={route.line.transitType}
                        />
                    </div>
                );
            });
    }

    private routeList(routes: IRoute[]) {
        return routes.map((route: IRoute) => {
            return (
                <div className='editable-line' key={route.lineId}>
                    <span className='line-wrapper'>
                        {LineHelper.getTransitIcon(route.line.transitType, false)}
                        <span className={'line-number-' + route.line.transitType}>
                            {route.line.lineNumber}
                        </span>
                        {route.routeName}
                    </span>
                    {
                        this.directionList(route)
                    }
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
        });
    }

    public render(): any {
        return (
            <span className='editable-line-wrapper'>
                {
                    this.routeList(this.props.routeStore!.routes)
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
                    <span className='editableLine-input-container-title'>
                        TARKASTELUPÄIVÄ
                    </span>
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
