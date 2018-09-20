import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { SearchStore } from '../../../stores/searchStore';
import * as s from './lineSearch.scss';

interface ILineSearchProps {
    searchStore?: SearchStore;
}

interface ILineSearchState {
    lineItems: any;
}

@inject('searchStore')
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
        this.props.searchStore!.setSearchInput(newValue);
    }

    public render(): any {
        return (
            <div className={s.lineSearchView}>
                <div className={s.inputContainer}>
                    <input
                        placeholder='Hae'
                        className={s.input}
                        type='text'
                        value={this.props.searchStore!.searchInput}
                        onChange={this.handleSearchInputChange}
                    />
                </div>
            </div>
        );
    }
}

export default LineSearch;
