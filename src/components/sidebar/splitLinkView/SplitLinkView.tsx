import React from 'react';
import { observer } from 'mobx-react';

interface ISplitLinkViewState {
    isLoading: boolean;
}

@observer
class SplitLinkView extends React.Component<{}, ISplitLinkViewState> {
    render() {
        return (
            <div>
                Linkin jakoo
            </div >
        );
    }
}
export default SplitLinkView;
