import React from 'react';
import classnames from 'classnames';
import Moment from 'react-moment';
import { IRoutePath } from '~/models';
import ViewHeader from '../ViewHeader';
import * as s from './routePathView.scss';

interface IRoutePathHeaderProps {
    hasModifications?: boolean;
    routePath: IRoutePath;
    isAddingNew: boolean;
}

class RoutePathHeader extends React.Component<IRoutePathHeaderProps> {
    render() {
        // tslint:disable-next-line:max-line-length
        const message = 'Reitin suunnalla tallentamattomia muutoksia. Oletko varma, että poistua näkymästä? Tallentamattomat muutokset kumotaan.';

        return (
            <div className={classnames(s.formSection, s.content, s.borderBotton)}>
                <ViewHeader
                    closePromptMessage={this.props.hasModifications ? message : undefined}
                >
                    {this.props.isAddingNew ? 'Uusi reitinsuunta' :
                        `${this.props.routePath.lineId} > ${this.props.routePath.routeId}`}
                </ViewHeader>
                <div className={s.topic}>
                    <Moment
                        date={this.props.routePath.startTime}
                        format='DD.MM.YYYY'
                    /> - &nbsp;
                    <Moment
                        date={this.props.routePath.endTime}
                        format='DD.MM.YYYY'
                    />
                    <br/>
                    Suunta {this.props.routePath.direction}:&nbsp;
                    {this.props.routePath.originFi} - {this.props.routePath.destinationFi}
                </div>
            </div>
        );
    }
}

export default RoutePathHeader;
