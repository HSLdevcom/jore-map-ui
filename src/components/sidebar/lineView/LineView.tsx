import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { match } from 'react-router';
import Button from '~/components/controls/Button';
import { ContentItem, ContentList, Tab, Tabs, TabList } from '~/components/shared/Tabs';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import ButtonType from '~/enums/buttonType';
import LineFactory from '~/factories/lineFactory';
import { ILine } from '~/models';
import lineValidationModel from '~/models/validationModels/lineValidationModel';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LineService from '~/services/lineService';
import { AlertStore } from '~/stores/alertStore';
import { ErrorStore } from '~/stores/errorStore';
import { LineStore } from '~/stores/lineStore';
import SidebarHeader from '../SidebarHeader';
import LineInfoTab from './LineInfoTab';
import LineRoutesTab from './LineRoutesTab';
import * as s from './lineView.scss';

interface ILineViewProps {
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
    lineStore?: LineStore;
    match?: match<any>;
    isNewLine: boolean;
}

interface ILineViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
    isEditingDisabled: boolean;
    selectedTabIndex: number;
}

@inject('lineStore', 'errorStore', 'alertStore')
@observer
class LineView extends ViewFormBase<ILineViewProps, ILineViewState> {
    constructor(props: ILineViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            invalidPropertiesMap: {},
            isEditingDisabled: !props.isNewLine,
            selectedTabIndex: 0
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.initialize();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.props.lineStore!.clear();
    }

    private setSelectedTabIndex = (index: number) => {
        this.setState({
            selectedTabIndex: index
        });
    };

    private initialize = async () => {
        if (this.props.isNewLine) {
            await this.createNewLine();
        } else {
            await this.initExistingLine();
        }
        if (this.props.lineStore!.line) {
            this.validateLine();
            this.setState({
                isLoading: false
            });
        }
    };

    private createNewLine = async () => {
        try {
            if (!this.props.lineStore!.line) {
                const newLine = LineFactory.createNewLine();
                this.props.lineStore!.setLine(newLine);
            }
        } catch (e) {
            this.props.errorStore!.addError('Uuden linjan luonti epäonnistui', e);
        }
    };

    private initExistingLine = async () => {
        await this.fetchLine();
    };

    private fetchLine = async () => {
        const lineId = this.props.match!.params.id;
        try {
            const line = await LineService.fetchLine(lineId);
            this.props.lineStore!.setLine(line);
        } catch (e) {
            this.props.errorStore!.addError('Linjan haku epäonnistui.', e);
        }
    };

    private onChangeLineProperty = (property: keyof ILine) => (value: any) => {
        this.props.lineStore!.updateLineProperty(property, value);
        this.validateProperty(lineValidationModel[property], property, value);
    };

    private save = async () => {
        this.setState({ isLoading: true });

        const line = this.props.lineStore!.line;
        try {
            if (this.props.isNewLine) {
                await LineService.createLine(line!);
            } else {
                await LineService.updateLine(line!);
            }

            this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
            return;
        }
        if (this.props.isNewLine) {
            this.navigateToNewLine();
            return;
        }
        this.setState({
            isEditingDisabled: true,
            invalidPropertiesMap: {},
            isLoading: false
        });
    };

    private navigateToNewLine = () => {
        const line = this.props.lineStore!.line;
        const lineViewLink = routeBuilder
            .to(SubSites.line)
            .toTarget(':id', line!.id)
            .toLink();
        navigator.goTo(lineViewLink);
    };

    private toggleIsEditing = () => {
        const isEditingDisabled = this.state.isEditingDisabled;
        if (!isEditingDisabled) {
            this.props.lineStore!.resetChanges();
        }
        this.toggleIsEditingDisabled();
        if (!isEditingDisabled) this.validateLine();
    };

    private validateLine = () => {
        this.validateAllProperties(lineValidationModel, this.props.lineStore!.line);
    };

    private renderLineViewHeader = () => {
        return (
            <div className={s.sidebarHeaderSection}>
                <SidebarHeader
                    isEditButtonVisible={!this.props.isNewLine}
                    onEditButtonClick={this.toggleIsEditing}
                    isEditing={!this.state.isEditingDisabled}
                    shouldShowClosePromptMessage={this.props.lineStore!.isDirty}
                >
                    {this.props.isNewLine
                        ? 'Luo uusi linja'
                        : `Linja ${this.props.lineStore!.line!.id}`}
                </SidebarHeader>
            </div>
        );
    };

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.lineView, s.loaderContainer)}>
                    <Loader size={LoaderSize.MEDIUM} />
                </div>
            );
        }
        if (!this.props.lineStore!.line) return null;

        const isSaveButtonDisabled =
            this.state.isEditingDisabled || !this.props.lineStore!.isDirty || !this.isFormValid();

        return (
            <div className={s.lineView}>
                <div className={s.content}>
                    {this.renderLineViewHeader()}
                    <Tabs>
                        <TabList
                            selectedTabIndex={this.state.selectedTabIndex}
                            setSelectedTabIndex={this.setSelectedTabIndex}
                        >
                            <Tab>
                                <div>Linjan tiedot</div>
                            </Tab>
                            <Tab isDisabled={this.props.isNewLine}>
                                <div>Reitit</div>
                            </Tab>
                        </TabList>
                        <ContentList selectedTabIndex={this.state.selectedTabIndex}>
                            <ContentItem>
                                <LineInfoTab
                                    isEditingDisabled={this.state.isEditingDisabled}
                                    isNewLine={this.props.isNewLine}
                                    onChangeLineProperty={this.onChangeLineProperty}
                                    invalidPropertiesMap={this.state.invalidPropertiesMap}
                                    setValidatorResult={this.setValidatorResult}
                                />
                            </ContentItem>
                            <ContentItem>
                                <LineRoutesTab />
                            </ContentItem>
                        </ContentList>
                    </Tabs>
                    <Button
                        onClick={this.save}
                        type={ButtonType.SAVE}
                        disabled={isSaveButtonDisabled}
                    >
                        {this.props.isNewLine ? 'Luo uusi linja' : 'Tallenna muutokset'}
                    </Button>
                </div>
            </div>
        );
    }
}

export default LineView;
