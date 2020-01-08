import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import * as s from './loader.scss';

type loaderSize = 'tiny' | 'small' | 'medium';

interface ILoaderProps {
    size?: loaderSize;
    hasNoMargin?: boolean;
}

const Loader = observer((props: ILoaderProps) => (
    <div
        className={classnames(
            s.loaderContainer,
            s[props.size! || 'medium'],
            props.hasNoMargin ? s.hasNoMargin : undefined
        )}
    >
        <div className={classnames(s.loader, s[props.size! || 'medium'])} />
    </div>
));

export default Loader;
