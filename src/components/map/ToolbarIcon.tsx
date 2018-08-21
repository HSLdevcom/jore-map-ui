import React, { Component } from 'react';
import * as s from './toolbarIcon.scss';
import classnames from 'classnames';

interface ToolbarIconProps {
    label: string;
    onClick: () => void;
    isActive: boolean;
    isDisabled: boolean;
}

export default class ToolbarIcon extends Component<ToolbarIconProps>{
    render () {
        const classes = classnames(
            s.toolbarIcon,
            this.props.isActive && !this.props.isDisabled ? s.active : null,
            this.props.isDisabled ? s.disabled : null,
        );

        const onClick = () => {
            if (!this.props.isDisabled) {
                this.props.onClick();
            }
        };

        return (
            <div
                className={classes}
                onClick={onClick}
            >
                <span className={s.tooltiptext}>
                    {
                        this.props.label
                    }
                </span>
                {
                    this.props.children
                }
            </div>
        );
    }
}
