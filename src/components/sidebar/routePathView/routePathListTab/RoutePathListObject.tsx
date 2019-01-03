import * as React from 'react';
import classnames from 'classnames';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import * as s from './routePathListObject.scss';

interface IRoutePathListObjectProps {
    headerLabel: string;
    description?: JSX.Element;
    id: string;
    content: JSX.Element;
}

interface IRoutePathListObjectState {
    isExtended: boolean;
}

class RoutePathListObject
    extends React.Component<IRoutePathListObjectProps, IRoutePathListObjectState> {
    constructor(props: IRoutePathListObjectProps) {
        super(props);

        this.state = {
            isExtended: false,
        };
    }

    private toggleIsExtended = () => {
        this.setState({
            isExtended: !this.state.isExtended,
        });
    }

    render() {
        return (
            <div className={s.item}>
                <div
                    className={
                        classnames(
                            s.itemHeader,
                            this.state.isExtended ? s.itemExtended : null,
                        )
                    }
                    onClick={this.toggleIsExtended}
                >
                    <div className={s.attributes}>
                        <div className={s.label}>
                            {this.props.headerLabel}
                            <div className={s.id}>
                                {this.props.id}
                            </div>
                        </div>
                        <div>
                            {this.props.description}
                        </div>
                    </div>
                    <div className={s.itemToggle}>
                        {this.state.isExtended && <FaAngleDown />}
                        {!this.state.isExtended && <FaAngleRight />}
                    </div>
                </div>
                { this.state.isExtended &&
                    <div className={s.itemContent}>
                        {this.props.content}
                    </div>
                }
            </div>
        );
    }
}

export default RoutePathListObject;
