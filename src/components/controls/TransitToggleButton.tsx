import classNames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import TransitType from '~/enums/transitType';
import TransitTypeHelper from '~/utils/TransitTypeHelper';
import TransitIcon from '../shared/TransitIcon';
import * as s from './transitToggleButton.scss';

interface ITransitToggleButtonProps {
    type: TransitType;
    toggled: boolean;
    disabled?: boolean;
    toggleActivity(event: TransitType): void;
}

const TransitToggleButton = observer((props: ITransitToggleButtonProps) => {
    const toggleActivity = () => {
        props.toggleActivity(props.type);
    };

    const getToggledButtonClass = (transitType: TransitType, isToggled: boolean) => {
        if (isToggled) {
            return TransitTypeHelper.getBackgroundColorClass(transitType);
        }
        return s.toggled;
    };

    return (
        <div
            className={classNames(
                s.button,
                getToggledButtonClass(props.type, props.toggled),
                props.disabled ? s.disabled : undefined
            )}
            onClick={!props.disabled ? toggleActivity : void 0}
        >
            {<TransitIcon transitType={props.type} isWithoutBox={true} />}
        </div>
    );
});

export default TransitToggleButton;
