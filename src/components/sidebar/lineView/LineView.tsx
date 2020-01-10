import { inject, observer } from 'mobx-react';
import React from 'react';
import { match } from 'react-router';
import SavePrompt, { ISaveModel } from '~/components/overlays/SavePrompt';
import { ContentItem, ContentList, Tab, Tabs, TabList } from '~/components/shared/Tabs';
import Loader from '~/components/shared/loader/Loader';
import LineFactory from '~/factories/lineFactory';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LineService from '~/services/lineService';
import RouteService from '~/services/routeService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { LineHeaderMassEditStore } from '~/stores/lineHeaderMassEditStore';
import { LineStore } from '~/stores/lineStore';
import { MapStore } from '~/stores/mapStore';
import SidebarHeader from '../SidebarHeader';
import LineInfoTab from './LineInfoTab';
import LineRoutesTab from './LineRoutesTab';
import * as s from './lineView.scss';

interface ILineViewProps {
    match?: match<any>;
    isNewLine: boolean;
    alertStore?: AlertStore;
    errorStore?: ErrorStore;
    lineHeaderMassEditStore?: LineHeaderMassEditStore;
    lineStore?: LineStore;
    confirmStore?: ConfirmStore;
    mapStore?: MapStore;
}

interface ILineViewState {
    isLoading: boolean;
    selectedTabIndex: number;
}

@inject(
    'lineStore',
    'lineHeaderMassEditStore',
    'errorStore',
    'alertStore',
    'mapStore',
    'confirmStore'
)
@observer
class LineView extends React.Component<ILineViewProps, ILineViewState> {
    constructor(props: ILineViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            selectedTabIndex: 0
        };
    }

    componentDidMount() {
        this.initialize();
        this.props.lineStore!.setIsEditingDisabled(!this.props.isNewLine);
    }

    componentWillUnmount() {
        this.props.lineStore!.clear();
    }

    private setSelectedTabIndex = (index: number) => {
        this.setState({
            selectedTabIndex: index
        });
    };

    private initialize = async () => {
        this.props.mapStore!.initCoordinates();
        if (this.props.isNewLine) {
            await this.createNewLine();
        } else {
            await this.initExistingLine();
        }
        if (this.props.lineStore!.line) {
            this.setState({
                isLoading: false
            });
        }
    };

    private createNewLine = async () => {
        try {
            if (!this.props.lineStore!.line) {
                const newLine = LineFactory.createNewLine();
                this.props.lineStore!.init({ line: newLine, isNewLine: true });
            }
        } catch (e) {
            this.props.errorStore!.addError('Uuden linjan luonti epäonnistui', e);
        }
    };

    private initExistingLine = async () => {
        const lineId = this.props.match!.params.id;
        try {
            const line = await LineService.fetchLine(lineId);
            const routes = await RouteService.fetchAllRoutesByLineId(lineId);
            line.routes = routes;
            this.props.lineStore!.init({ line, isNewLine: false });
        } catch (e) {
            this.props.errorStore!.addError('Linjan haku epäonnistui.', e);
        }
    };

    private saveLine = async () => {
        this.setState({ isLoading: true });

        const line = this.props.lineStore!.line;
        try {
            if (this.props.isNewLine) {
                await LineService.createLine(line!);
            } else {
                await LineService.updateLine(line!);
            }

            this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
            return;
        }
        if (this.props.isNewLine) {
            this.navigateToNewLine();
            return;
        }
        this.props.lineStore!.setOldLine(line!);
        this.setState({
            isLoading: false
        });
        this.props.lineStore!.setIsEditingDisabled(true);
    };

    private navigateToNewLine = () => {
        const line = this.props.lineStore!.line;
        const lineViewLink = routeBuilder
            .to(SubSites.line)
            .toTarget(':id', line!.id)
            .toLink();
        navigator.goTo({ link: lineViewLink, shouldSkipUnsavedChangesPrompt: true });
    };

    private showSavePrompt = () => {
        const confirmStore = this.props.confirmStore;
        const currentLine = this.props.lineStore!.line;
        const oldLine = this.props.lineStore!.oldLine;
        const saveModel: ISaveModel = {
            newData: currentLine ? currentLine : {},
            oldData: oldLine,
            model: 'line'
        };

        confirmStore!.openConfirm({
            content: <SavePrompt saveModels={[saveModel]} />,
            onConfirm: () => {
                this.saveLine();
            }
        });
    };

    render() {
        const lineStore = this.props.lineStore;
        const lineHeaderMassEditStore = this.props.lineHeaderMassEditStore;
        if (this.state.isLoading) {
            return (
                <div className={s.lineView}>
                    <Loader size='medium' />
                </div>
            );
        }
        if (!this.props.lineStore!.line) return null;
        const isEditingDisabled = lineStore!.isEditingDisabled;
        const isSaveButtonDisabled =
            isEditingDisabled || !lineStore!.isDirty || !lineStore!.isLineFormValid;
        return (
            <div className={s.lineView}>
                <div className={s.sidebarHeaderSection}>
                    <SidebarHeader
                        isEditButtonVisible={!this.props.isNewLine}
                        onEditButtonClick={lineStore!.toggleIsEditingDisabled}
                        isEditing={!lineStore!.isEditingDisabled}
                        shouldShowClosePromptMessage={
                            lineStore!.isDirty || lineHeaderMassEditStore!.isDirty
                        }
                        shouldShowEditButtonClosePromptMessage={lineStore!.isDirty}
                    >
                        {this.props.isNewLine ? 'Luo uusi linja' : `Linja ${lineStore!.line!.id}`}
                    </SidebarHeader>
                </div>
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
                                isEditingDisabled={isEditingDisabled}
                                saveLine={this.showSavePrompt}
                                isLineSaveButtonDisabled={isSaveButtonDisabled}
                            />
                        </ContentItem>
                        <ContentItem>
                            <LineRoutesTab />
                        </ContentItem>
                    </ContentList>
                </Tabs>
            </div>
        );
    }
}

export default LineView;
