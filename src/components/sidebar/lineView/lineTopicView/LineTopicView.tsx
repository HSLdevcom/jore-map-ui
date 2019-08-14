import React from 'react';
import classnames from 'classnames';
import Moment from 'moment';
import { observer, inject } from 'mobx-react';
import { match } from 'react-router';
import ILineTopic from '~/models/ILineTopic';
import { ErrorStore } from '~/stores/errorStore';
import { AlertStore } from '~/stores/alertStore';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import LineTopicFactory from '~/factories/lineTopicFactory';
import LineTopicService from '~/services/lineTopicService';
import * as s from './lineTopicView.scss';

interface ILineTopicViewProps {
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
    match?: match<any>;
    isNewLineTopic: boolean;
}

interface ILineTopicViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    isEditingDisabled: boolean;
    lineTopic: ILineTopic | null;
}

@inject('errorStore', 'alertStore')
@observer
class LineTopicView extends ViewFormBase<
    ILineTopicViewProps,
    ILineTopicViewState
> {
    constructor(props: ILineTopicViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            invalidPropertiesMap: {},
            isEditingDisabled: !props.isNewLineTopic,
            lineTopic: null
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.initialize();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    private initialize = async () => {
        if (this.props.isNewLineTopic) {
            await this.createNewLine();
        } else {
            await this.initExistingLine();
        }
        if (this.state.lineTopic) {
            this.validateLineTopic();
            this.setState({
                isLoading: false
            });
        }
    };

    private createNewLine = async () => {
        try {
            const lineId = this.props.match!.params.id;
            const newLineTopic = LineTopicFactory.createNewLineTopic(lineId);
            this.setState({
                lineTopic: newLineTopic
            });
        } catch (e) {
            this.props.errorStore!.addError(
                'Uuden linjan nimen luonti epäonnistui',
                e
            );
        }
    };

    private initExistingLine = async () => {
        await this.fetchLine();
    };

    private fetchLine = async () => {
        const lineId = this.props.match!.params.id;
        const startDate = this.props.match!.params.startDate;

        try {
            const lineTopic = await LineTopicService.fetchLineTopic(
                lineId,
                startDate
            );
            this.setState({
                lineTopic
            });
        } catch (e) {
            this.props.errorStore!.addError(
                'Linja otsikon haku epäonnistui.',
                e
            );
        }
    };

    private validateLineTopic = () => {
        // TODO
    };

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.lineTopicView, s.loaderContainer)}>
                    <Loader size={LoaderSize.MEDIUM} />
                </div>
            );
        }
        if (!this.state.lineTopic) return null;

        const lineTopic = this.state.lineTopic;
        return (
            <div className={s.lineTopicView}>
                <div className={s.content}>
                    <div>lineId: {lineTopic!.lineId}</div>
                    <div>
                        startTime: {Moment(lineTopic!.startDate).format()}
                    </div>
                    <div>endTime: {Moment(lineTopic!.endDate).format()}</div>
                </div>
            </div>
        );
    }
}

export default LineTopicView;
