import React from 'react';
import { observer } from 'mobx-react';
import ReactMoment from 'react-moment';
import { IRoutePath } from '~/models';
import SidebarHeader from '../SidebarHeader';
import * as s from './routePathView.scss';

interface IRoutePathHeaderProps {
    hasModifications?: boolean;
    routePath: IRoutePath;
    isNewRoutePath: boolean;
    isEditing: boolean;
    onEditButtonClick: () => void;
}

const RoutePathHeader = observer((props: IRoutePathHeaderProps) => (
    <div className={s.sidebarHeaderSection}>
        <SidebarHeader
            isEditButtonVisible={!props.isNewRoutePath}
            onEditButtonClick={props.onEditButtonClick}
            isEditing={props.isEditing}
            shouldShowClosePromptMessage={props.hasModifications!}
        >
            {props.isNewRoutePath
                ? 'Uusi reitinsuunta'
                : `${props.routePath.lineId} > ${props.routePath.routeId}`}
        </SidebarHeader>
        <div className={s.topic}>
            <ReactMoment date={props.routePath.startTime} format='DD.MM.YYYY' /> - &nbsp;
            <ReactMoment date={props.routePath.endTime} format='DD.MM.YYYY' />
            <br />
            Suunta {props.routePath.direction}:&nbsp;
            {props.routePath.originFi} - {props.routePath.destinationFi}
        </div>
    </div>
));
export default RoutePathHeader;
