import React from 'react';
import { Redirect, Route, RouteComponentProps, RouteProps, RedirectProps } from 'react-router-dom';
import LoginStore from '~/stores/loginStore';
import navigator from '~/routing/navigator';

type RouteComponent = React.FunctionComponent<RouteComponentProps<{}>> | React.ComponentClass<any>;

const PrivateRoute: React.FunctionComponent<RouteProps> = ({ component, ...rest }) => {
    const renderFn = (Component?: RouteComponent) => (props: any) => {
        if (!Component) {
            return null;
        }

        if (LoginStore.isAuthenticated) {
            return <Component {...props} />;
        }

        const redirectProps: RedirectProps = {
            to: {
                pathname: '/login',
                state: { from: navigator.getFullPath() },
            },
        };

        return <Redirect {...redirectProps} />;
    };

    return <Route {...rest} render={renderFn(component)} />;
};

export default PrivateRoute;
