import { observer } from 'mobx-react';
import React from 'react';
import * as s from './loader.scss';

// TODO: refactor as type instead
export enum LoaderSize {
    TINY = 'tiny',
    SMALL = 'small',
    MEDIUM = 'medium'
}

interface ILoaderProps {
    size?: LoaderSize;
}

const Loader = observer((props: ILoaderProps) => (
    <div id={s.loader} className={s[props.size! || LoaderSize.MEDIUM]} />
));

export default Loader;
