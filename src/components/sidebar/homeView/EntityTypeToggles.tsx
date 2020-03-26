import { inject, observer } from 'mobx-react';
import React from 'react';
import { IoIosRadioButtonOff, IoMdAnalytics } from 'react-icons/io';
import ToggleView, { ToggleItem } from '~/components/shared/ToggleView';
import { SearchStore } from '~/stores/searchStore';

interface IEntityTypeToggleProps {
    searchStore?: SearchStore;
}

@inject('searchStore')
@observer
class EntityTypeToggles extends React.Component<IEntityTypeToggleProps> {
    private toggleSearchingLines = () => {
        this.props.searchStore!.toggleIsSearchingForLines();
    };

    private toggleSearchingNodes = () => {
        this.props.searchStore!.toggleIsSearchingForNodes();
    };

    render() {
        return (
            <ToggleView>
                <ToggleItem
                    icon={<IoMdAnalytics />}
                    text='Linjat ja Reitit'
                    isActive={this.props.searchStore!.isSearchingForLines}
                    onClick={this.toggleSearchingLines}
                    data-cy='lineToggle'
                />
                <ToggleItem
                    icon={<IoIosRadioButtonOff />}
                    text='Solmut'
                    isActive={this.props.searchStore!.isSearchingForNodes}
                    onClick={this.toggleSearchingNodes}
                    data-cy='nodeToggle'
                />
            </ToggleView>
        );
    }
}

export default EntityTypeToggles;
