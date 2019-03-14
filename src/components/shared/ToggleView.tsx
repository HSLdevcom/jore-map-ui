import React from 'react';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { SearchStore } from '~/stores/searchStore';
import * as s from './toggleView.scss';

interface IEntityTypeToggleProps {
    searchStore?: SearchStore;
}

@inject('searchStore')
@observer
class ToggleView extends React.Component<IEntityTypeToggleProps> {
    render() {
        return (
            <div className={s.toggleView}>
                <div className={s.buttonContainer}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

interface IToggleItemProps {
    icon?: JSX.Element;
    text: string;
    isActive: boolean;
    onClick(): void;
}

export class ToggleItem extends React.Component<IToggleItemProps> {
    render() {
        const { icon, text, isActive, onClick } = this.props;
        return (
            <div
                className={s.buttonContainer}
            >
                <div
                    className={classnames(
                        s.button,
                        isActive ? s.active : null,
                    )}
                    onClick={onClick}
                >
                    {icon}
                    <div>
                        {text}
                    </div>
                </div>
            </div>
        );
    }
}

export default ToggleView;
