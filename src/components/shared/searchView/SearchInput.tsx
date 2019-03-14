import { inject, observer } from 'mobx-react';
import React from 'react';
import { SearchStore } from '~/stores/searchStore';
import * as s from './searchInput.scss';

interface ISearchInputProps {
    searchStore?: SearchStore;
}

@inject('searchStore')
@observer
class SearchInput extends React.Component<ISearchInputProps> {
    private handleSearchInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        this.props.searchStore!.setSearchInput(newValue);
    }

    render() {
        return (
            <div className={s.lineSearchView}>
                <div className={s.inputContainer}>
                    <input
                        placeholder='Hae'
                        type='text'
                        value={this.props.searchStore!.searchInput}
                        onChange={this.handleSearchInputChange}
                    />
                </div>
            </div>
        );
    }
}

export default SearchInput;
