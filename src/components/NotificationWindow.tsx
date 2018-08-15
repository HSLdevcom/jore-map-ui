import { inject, observer } from 'mobx-react';
import * as React from 'react';
import * as s from './notificationWindow.scss';
import classnames from 'classnames';
import NotificationType from '../enums/notificationType';
import { NotificationStore } from '../stores/notificationStore';

interface INotificationWindow {
    notificationStore?: NotificationStore;
    notifications: object[];
}

interface INotification {
    message: string;
    type: string;
}

@inject('notificationStore')
@observer
class NotificationWindow extends React.Component<INotificationWindow> {

    private closeNotification = (message: string) => {
        this.props.notificationStore!.closeNotification(message);
    }

    getColorClass = (type: string) => {
        switch (type) {
        case NotificationType.ERROR: {
            return s.error;
        }
        case NotificationType.WARNING: {
            return s.warning;
        }
        case NotificationType.SUCCESS: {
            return s.success;
        }
        default: {
            return s.success;
        }
        }
    }

    public render(): any {
        return (
          <div className={s.notificationView}>
            {this.props.notifications.map((notification: INotification) => {
                if (!notification) return;
                return (
                  <div
                    key={notification.message}
                    className={classnames(
                      s.notificationItem,
                      this.getColorClass(notification.type))
                    }
                    onClick={this.closeNotification.bind(this, notification.message)}
                  >
                    {notification.message}
                  </div>
                );
            })}
          </div>
        );
    }
}
export default NotificationWindow;
