import * as React from 'react';
import { Redirect, Route, RouteComponentProps, RouteProps } from 'react-router-dom';
import LoginStore from '~/stores/loginStore';

type RouteComponent = React.FunctionComponent<RouteComponentProps<{}>> | React.ComponentClass<any>;

/* tslint:disable:variable-name */
const PrivateRoute: React.FunctionComponent<RouteProps> = ({ component, ...rest }) => {
    const renderFn = (Component?: RouteComponent) => (props: any) => {
        if (!Component) {
            return null;
        }

        if (LoginStore.isAuthenticated) {
            return <Component {...props} />;
        }

        const redirectProps = {
            to: {
                pathname: '/login',
                state: { from: props.location },
            },
        };

        return <Redirect {...redirectProps} />;
    };

    return <Route {...rest} render={renderFn(component)} />;
};
/* tslint:enable:variable-name */

export default PrivateRoute;
