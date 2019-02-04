import React from 'react';
import { IoMdAnalytics, IoMdLocate } from 'react-icons/io';
import * as s from './entityTypeToggles.scss';

const entityTypeToggles = () => (
    <div className={s.entityTypeTogglesView}>
        <IoMdAnalytics />
        <IoMdLocate />
    </div>
);

export default entityTypeToggles;
