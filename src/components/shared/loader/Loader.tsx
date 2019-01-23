import React from 'react';
import * as s from './loader.scss';

interface ILoaderProps {
    size?: string;
}

class Loader extends React.Component<ILoaderProps> {
    static SMALL = 'small';
    static MEDIUM = 'medium';

    render() {
        return (
            <div id={s.loader} className={s[this.props.size! || Loader.MEDIUM]}/>
        );
    }
}

export default Loader;
