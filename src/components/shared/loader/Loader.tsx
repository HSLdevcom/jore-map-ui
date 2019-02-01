import React from 'react';
import * as s from './loader.scss';

export enum LoaderSize {
    TINY = 'tiny',
    SMALL = 'small',
    MEDIUM = 'medium',
}

interface ILoaderProps {
    size?: LoaderSize;
}

class Loader extends React.Component<ILoaderProps> {
    render() {
        return (
            <div id={s.loader} className={s[this.props.size! || LoaderSize.MEDIUM]}/>
        );
    }
}

export default Loader;
