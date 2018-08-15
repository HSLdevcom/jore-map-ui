import { inject, observer } from 'mobx-react';
import * as React from 'react';
import * as s from './notificationWindow.scss';
import classnames from 'classnames';
import NotificationType from '../enums/notificationType';
import { NotificationStore } from '../stores/notificationStore';

interface INotificationWindowProps {
    notificationStore?: NotificationStore;
    notifications: object[];
}

interface INotificationWindowState {
    disappearingNotifications: string[];
}

interface INotification {
    message: string;
    type: string;
}

@inject('notificationStore')
@observer
class NotificationWindow extends React.Component
<INotificationWindowProps, INotificationWindowState> {

    constructor(props: INotificationWindowProps) {
        super(props);
        this.state = {
            disappearingNotifications: [], // used for disappearing animation
        };
    }

    private closeNotification = (message: string) => {
        const newDisappearingNotifications = this.state.disappearingNotifications;
        newDisappearingNotifications.push(message);
        this.setState({
            disappearingNotifications: newDisappearingNotifications,
        });
        setTimeout(
            () => {
                this.props.notificationStore!.closeNotification(message);
                const newDisappearingNotifications =
                    this.state.disappearingNotifications.filter(m => m !== message);
                this.setState({
                    disappearingNotifications: newDisappearingNotifications,
                });
            },
            500,
        );
    }

    private getDisappearingNotificationClass = (message: string) => {
        if (this.state.disappearingNotifications.includes(message)) {
            return s.notificationItemDisappear;
        }
        return;
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
                        this.getColorClass(notification.type),
                        this.getDisappearingNotificationClass(notification.message),
                    )
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
