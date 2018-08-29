import React, { Component } from 'react';
import * as s from './toolbarButton.scss';
import classnames from 'classnames';

interface ToolbarButtonProps {
    label: string;
    onClick: () => void;
    isActive: boolean;
    isDisabled: boolean;
}

export default class ToolbarButton extends Component<ToolbarButtonProps>{
    render () {
        const classes = classnames(
            s.toolbarButton,
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
