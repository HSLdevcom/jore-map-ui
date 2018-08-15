import * as React from 'react';
import * as s from './notificationWindow.scss';
import classnames from 'classnames';

interface IErrorWindow {
    notifications: object[];
    hideError: Function;
}

class ErrorWindow extends React.Component<IErrorWindow> {

    public onErrorWindowClick = (message: string) => {
        this.props.hideError(message);
    }

    getColorClass = (type: string) => {
        switch (type) {
        case 'error': {
            return s.error;
        }
        case 'warning': {
            return s.warning;
        }
        default: {
            return s.success;
        }
        }
    }

    public render(): any {
        const notifications = this.props.notifications.map((notification: any) => {
            if (!notification) return;

            return (
              <div
                key={notification.message}
                className={classnames(s.notificationItem, this.getColorClass(notification.type))}
                onClick={this.onErrorWindowClick.bind(this, notification.message)}
              >
                {notification.message}
              </div>
            );
        });

        return (
          <div className={s.notificationView}>
            {notifications}
          </div>
        );
    }
}
export default ErrorWindow;
