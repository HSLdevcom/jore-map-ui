import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import LineItems from './LineItems';
import * as s from './lineSearch.scss';

interface ILineSearchProps {
    lineStore?: LineStore;
    showSearchResults: boolean;
}

interface ILineSearchState {
    lineItems: any;
}

@inject('lineStore')
@observer
class LineSearch extends React.Component<ILineSearchProps, ILineSearchState> {
    constructor(props: ILineSearchProps) {
        super(props);
        this.state = {
            lineItems: '',
        };
    }

    public handleSearchInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        this.props.lineStore!.setSearchInput(newValue);
    }

    public render(): any {
        return (
            <div className={s.lineSearchView}>
                <div className={s.inputContainer}>
                    <input
                        placeholder='Hae'
                        className={s.input}
                        type='text'
                        value={this.props.lineStore!.searchInput}
                        onChange={this.handleSearchInputChange}
                    />
                </div>
                { this.props.showSearchResults &&
                <div className={s.searchResultsContainer}>
                    <TransitToggleButtonBar
                        filters={this.props.lineStore!.filters || []}
                    />
                    <LineItems
                        searchInput={this.props.lineStore!.searchInput}
                    />
                </div>
                }
            </div>
        );
    }
}

export default LineSearch;
