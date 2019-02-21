import React from 'react';
import classnames from 'classnames';
import Moment from 'react-moment';
import { IRoutePath } from '~/models';
import ViewHeader from '../ViewHeader';
import * as s from './routePathView.scss';

interface IRoutePathHeaderProps {
    hasModifications?: boolean;
    routePath: IRoutePath;
    isNewRoutePath: boolean;
    isEditing: boolean;
    onEditButtonClick: () => void;
}

const RoutePathHeader = (props: IRoutePathHeaderProps) => (
    <div className={classnames(s.formSection, s.content, s.borderBotton)}>
        <ViewHeader
            isEditButtonVisible={true}
            onEditButtonClick={props.onEditButtonClick}
            isEditing={props.isEditing}
            preventFromReseting={props.hasModifications!}
        >
            {props.isNewRoutePath ? 'Uusi reitinsuunta' :
                `${props.routePath.lineId} > ${props.routePath.routeId}`}
        </ViewHeader>
        <div className={s.topic}>
            <Moment
                date={props.routePath.startTime}
                format='DD.MM.YYYY'
            /> - &nbsp;
            <Moment
                date={props.routePath.endTime}
                format='DD.MM.YYYY'
            />
            <br/>
            Suunta {props.routePath.direction}:&nbsp;
            {props.routePath.originFi} - {props.routePath.destinationFi}
        </div>
    </div>
);
export default RoutePathHeader;
