import * as React from 'react';
import * as s from './loader.scss';

class Loader extends React.Component {
    render() {
        return (
            <div id={s.loader}/>
        );
    }
}

export default Loader;
