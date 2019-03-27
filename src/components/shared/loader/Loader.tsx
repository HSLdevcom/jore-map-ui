import React from 'react';
import { observer } from 'mobx-react';
import * as s from './loader.scss';

export enum LoaderSize {
    TINY = 'tiny',
    SMALL = 'small',
    MEDIUM = 'medium',
}

interface ILoaderProps {
    size?: LoaderSize;
}

const Loader = observer((props: ILoaderProps) =>
    <div id={s.loader} className={s[props.size! || LoaderSize.MEDIUM]}/>,
);

export default Loader;
