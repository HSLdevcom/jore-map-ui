import * as React from 'react';
import classnames from 'classnames';
import ViewHeader from '../ViewHeader';
import * as s from './routePathView.scss';

class RoutePathView extends React.Component{
    public render(): any {
        return (
        <div className={s.routePathView}>
            <ViewHeader
                header='Reitin suunta 1016'
            />
            <div className={s.routePathTimestamp}>01.09.2017</div>
            <div className={classnames(s.flexColumn, s.subTopic)}>
                REITIN OTSIKKOTIEDOT
            </div>
            <div className={s.routeInformationContainer}>
                <div className={s.flexInnerColumn}>
                    <div>Reittitunnus</div>
                    <div>1016</div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div>Linja</div>
                    <div>1016</div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div>Päivityspvm</div>
                    <div>23.08.2017</div>
                </div>
                <div className={s.flexInnerColumn}>
                    <div>Päivittää</div>
                    <div>Vuori Tuomas</div>
                </div>
            </div>
        </div>
        );
    }
}
export default RoutePathView;
