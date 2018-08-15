import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import LineItems from './LineItems';
import * as s from './lineSearch.scss';

interface ILineSearchProps {
    lineStore?: LineStore;
    onInputChange?: Function;
    showSearchResults: boolean;
}

interface ILineSearchState {
    searchInput: string;
    lineItems: any;
}

@inject('lineStore')
@observer
class LineSearch extends React.Component<ILineSearchProps, ILineSearchState> {
    constructor(props: ILineSearchProps) {
        super(props);
        this.state = {
            lineItems: '',
            searchInput: '',
        };
    }

    public handleSearchInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        this.setState({
            searchInput: newValue,
        });
        if (this.props.onInputChange) {
            this.props.onInputChange(newValue);
        }
    }

    public render(): any {
        return (
            <div className={s.lineSearchView}>
                <div className={s.inputContainer}>
                    <input
                        placeholder='Hae'
                        className={s.input}
                        type='text'
                        value={this.state.searchInput}
                        onChange={this.handleSearchInputChange}
                    />
                </div>
                { this.props.showSearchResults &&
                <div className={s.searchResultsContainer}>
                    <TransitToggleButtonBar
                        filters={this.props.lineStore!.filters || []}
                    />
                    <LineItems
                        filters={this.props.lineStore!.filters || []}
                        searchInput={this.state.searchInput}
                    />
                </div>
                }
            </div>
        );
    }
}

export default LineSearch;
