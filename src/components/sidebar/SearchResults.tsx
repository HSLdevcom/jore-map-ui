import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import LineItems from './LineItems';
import * as s from './searchResults.scss';

interface ISearchResultsProps {
    lineStore?: LineStore;
    location: any;
}

interface ISearchResultsState {
    lineItems: any;
}

@inject('lineStore')
@observer
class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {
    constructor(props: ISearchResultsProps) {
        super(props);
        this.state = {
            lineItems: '',
        };
    }

    public render(): any {
        return (
            <div className={s.lineSearchView}>
                <div className={s.searchResultsContainer}>
                    <TransitToggleButtonBar
                        filters={this.props.lineStore!.filters || []}
                    />
                    <LineItems
                        searchInput={this.props.lineStore!.searchInput}
                        location={this.props.location}
                    />
                </div>
            </div>
        );
    }
}

export default SearchResults;
