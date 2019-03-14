import React from 'react';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { SearchStore } from '~/stores/searchStore';
import * as s from './toggleView.scss';

export interface ToggleItem {
    icon?: JSX.Element;
    text: string;
    isActive: boolean;
    onClick(): void;
}

interface IEntityTypeToggleProps {
    searchStore?: SearchStore;
    toggles: ToggleItem[];
}

@inject('searchStore')
@observer
class ToggleView extends React.Component<IEntityTypeToggleProps> {

    render() {
        return (
            <div className={s.toggleView}>
                <div className={s.buttonContainer}>
                    {
                        this.props.toggles.map((toggle, index) => {
                            return (
                                <div
                                    key={index}
                                    className={s.buttonContainer}
                                >
                                    <div
                                        className={classnames(
                                            s.button,
                                            toggle.isActive ? s.active : null,
                                        )}
                                        onClick={toggle.onClick}
                                    >
                                        {toggle.icon}
                                        <div>
                                            {toggle.text}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

export default ToggleView;
