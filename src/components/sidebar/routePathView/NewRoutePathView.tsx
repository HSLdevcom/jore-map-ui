import * as React from 'react';
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './RoutePathViewForm';
import { Button } from '../../controls';
import ButtonType from '../../../enums/buttonType';
import * as s from './routePathView.scss';

class NewRoutePathView extends React.Component{

    // TODO
    public onChange = () => {
    }

    public render(): any {
        return (
        <div className={s.routePathView}>
            <ViewHeader
                header='Luo uusi reitinsuunta'
            />
            <div className={s.padding} />
            <div className={s.padding} />
            <RoutePathViewForm
                isEditingDisabled={false}
            />
            <div>
                <div className={s.sectionDivider} />
                <div className={s.padding} />
                <div className={s.flexRow}>
                    <Button
                        onClick={this.onChange}
                        type={ButtonType.SAVE}
                        text={'Tallenna reitinsuunta'}
                    />
                </div>
            </div>
        </div>
        );
    }
}
export default NewRoutePathView;
