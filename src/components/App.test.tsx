import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Route } from 'react-router';
import App from './App';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Route component={App} />, div);
    ReactDOM.unmountComponentAtNode(div);
});
