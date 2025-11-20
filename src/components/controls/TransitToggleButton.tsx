import classNames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import TransitType from '~/enums/transitType';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import TransitIcon from '../shared/TransitIcon';
import * as s from './transitToggleButton.scss';

interface ITransitToggleButtonProps {
    type: TransitType;
    toggled: boolean;
    disabled?: boolean;
    toggleActivity(event: TransitType): void;
}

const TransitToggleButton = observer((props: ITransitToggleButtonProps) => {
    const { type, toggled, disabled, toggleActivity, ...attrs } = props;

    return (
        <div
            className={classNames(
                s.button,
                toggled ? TransitTypeUtils.getBackgroundColorClass(type) : s.toggled,
                props.disabled ? s.disabled : undefined
            )}
            onClick={!disabled ? () => toggleActivity(type) : void 0}
            {...attrs}
        >
            {<TransitIcon transitType={props.type} isWithoutBox={true} />}
        </div>
    );
});

export default TransitToggleButton;
