import * as React from 'react';
import classnames from 'classnames';
import Moment from 'react-moment';
import { IRoutePath } from '~/models';
import ViewHeader from '../ViewHeader';
import * as s from './routePathView.scss';

interface IRoutePathHeaderProps {
    hasModifications?: boolean;
    routePath: IRoutePath;
}

class RoutePathHeader extends React.Component<IRoutePathHeaderProps> {
    render() {
        // tslint:disable-next-line:max-line-length
        const message = 'Reitin suunnalla tallentamattomia muutoksia. Oletko varma, että poistua näkymästä? Tallentamattomat muutokset kumotaan.';

        return (
            <div className={classnames(s.formSection, s.content, s.borderBotton)}>
                <ViewHeader
                    closePromptMessage={this.props.hasModifications ? message : undefined}
                    header='Reitinsuunta'
                />
                <div className={s.topic}>
                    OTSIKKOTIEDOT
                </div>
                <div className={s.routeInformationContainer}>
                    <div className={s.flexInnerColumn}>
                        <div>Reittitunnus</div>
                        <div>{this.props.routePath.routeId}</div>
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Linja</div>
                        <div>{this.props.routePath.lineId}</div>
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Päivityspvm</div>
                        <Moment
                            date={this.props.routePath.lastModified}
                            format='DD.MM.YYYY HH:mm'
                        />
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Päivittäjä</div>
                        <div>{this.props.routePath.modifiedBy}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default RoutePathHeader;
