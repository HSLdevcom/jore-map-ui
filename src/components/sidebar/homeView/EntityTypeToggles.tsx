import React from 'react';
import { inject, observer } from 'mobx-react';
import { IoMdAnalytics, IoIosRadioButtonOn } from 'react-icons/io';
import { SearchStore } from '~/stores/searchStore';
import ToggleView, { ToggleItem } from '~/components/shared/ToggleView';

interface IEntityTypeToggleProps {
    searchStore?: SearchStore;
}

@inject('searchStore')
@observer
class EntityTypeToggles extends React.Component<IEntityTypeToggleProps> {
    private toggleSearchingLines = () => {
        this.props.searchStore!.toggleIsSearchingForLines();
    }

    private toggleSearchingNodes = () => {
        this.props.searchStore!.toggleIsSearchingForNodes();
    }

    render() {
        const lineToggle: ToggleItem = {
            icon: <IoMdAnalytics />,
            text: 'Linjat ja Reitit',
            isActive: this.props.searchStore!.isSearchingForLines,
            onClick: this.toggleSearchingLines,
        };
        const nodeToggle: ToggleItem = {
            icon: <IoIosRadioButtonOn />,
            text: 'Solmut',
            isActive: this.props.searchStore!.isSearchingForNodes,
            onClick: this.toggleSearchingNodes,
        };

        return (
            <ToggleView
                toggles={[
                    lineToggle,
                    nodeToggle,
                ]}
            />
        );
    }
}

export default EntityTypeToggles;
