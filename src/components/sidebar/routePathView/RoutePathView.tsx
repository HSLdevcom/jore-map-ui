import * as React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import Moment from 'react-moment';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import { IRoutePath } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import RoutePathService from '~/services/routePathService';
import Loader from '~/components/shared/loader/Loader';
import ViewHeader from '../ViewHeader';
import RoutePathViewForm from './RoutePathViewForm';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    isEditingDisabled: boolean;
    hasModifications: boolean;
    routePath: IRoutePath | null;
}

interface IRoutePathViewProps {
}

class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: any) {
        super(props);
        this.state = {
            isEditingDisabled: true,
            hasModifications: false,
            routePath: null,
        };
    }

    public componentDidMount() {
        this.fetchRoutePath();
    }

    private async fetchRoutePath() {
        const routeId = navigator.getQueryParam(QueryParams.routeId);
        const direction = navigator.getQueryParam(QueryParams.direction);
        const startTime = moment(
            decodeURIComponent(navigator.getQueryParam(QueryParams.startTime)));
        const routePath =
            await RoutePathService.fetchRoutePath(routeId, startTime, direction);
        this.setState({ routePath });
    }

    public toggleEditing = () => {
        const isEditingDisabled = !this.state.isEditingDisabled;
        this.setState({ isEditingDisabled });
    }

    public save = () => {
        console.log('Saving');
        this.setState({ hasModifications: false });
    }

    public onEdit = () => {
        this.setState({ hasModifications: true });
    }

    public render(): any {
        if (!this.state.routePath) {
            return (
                <Loader size={Loader.MEDIUM}/>
            );
        }
        return (
        <div className={classnames(s.routePathView, s.form)}>
            <ViewHeader
                header={`Reitin suunta ${this.state.routePath.lineId}`}
            >
                <Button
                    onClick={this.toggleEditing}
                    type={ButtonType.SQUARE}
                    text={'Muokkaa'}
                />
            </ViewHeader>
            <div className={s.routePathTimestamp}>01.09.2017</div>
            <div className={s.formSection}>
                <div className={s.topic}>
                    REITIN OTSIKKOTIEDOT
                </div>
                <div className={s.routeInformationContainer}>
                    <div className={s.flexInnerColumn}>
                        <div>Reittitunnus</div>
                        <div>{this.state.routePath.routeId}</div>
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Linja</div>
                        <div>{this.state.routePath.lineId}</div>
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Päivityspvm</div>
                        <Moment
                            date={this.state.routePath.lastModified}
                            format='DD.MM.YYYY HH:mm'
                        />
                    </div>
                    <div className={s.flexInnerColumn}>
                        <div>Päivittää</div>
                        <div>{this.state.routePath.modifiedBy}</div>
                    </div>
                </div>
            </div>
            <div className={s.formSection}>
                <RoutePathViewForm
                    onEdit={this.onEdit}
                    isEditingDisabled={this.state.isEditingDisabled}
                    routePath={this.state.routePath}
                />
            </div>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <Button
                        onClick={this.save}
                        type={ButtonType.SAVE}
                        text={'Tallenna reitinsuunta'}
                        disabled={!this.state.hasModifications}
                    />
                </div>
            </div>
        </div>
        );
    }
}
export default RoutePathView;
