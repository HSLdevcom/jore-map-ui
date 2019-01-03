import * as React from 'react';
import { FaAngleRight } from 'react-icons/fa';
import * as s from './routePathListObject.scss';

interface IRoutePathListObjectProps {
    headerLabel: string;
    description?: JSX.Element;
    id: string;
    content?: JSX.Element;
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

    render() {
        return (
            <div className={s.item}>
                <div className={s.attributes}>
                    <div className={s.label}>
                        {this.props.headerLabel}
                        <div className={s.id}>
                            {this.props.id}
                        </div>
                    </div>
                    <div>
                        {
                            this.props.description
                        }
                    </div>
                </div>
                <div className={s.itemToggle}>
                    <FaAngleRight />
                </div>
            </div>
        );
    }
}

export default RoutePathListObject;
