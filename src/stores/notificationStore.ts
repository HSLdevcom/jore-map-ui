import { action, computed, observable } from 'mobx';

interface INotification {
    message: string;
    type: string;
}

export class NotificationStore {
    @observable private _notifications: INotification[];

    constructor() {
        this._notifications = [];
    }

    @computed
    get notifications(): INotification[] {
        return this._notifications;
    }

    @action
    public addNotification(notification: INotification) {
        if (this._notifications.filter(n => n.message === notification.message).length === 0) {
            this._notifications.push(notification);
        }
    }

    @action
    public closeNotification(message: string) {
        const notifications = this._notifications.filter((notification: INotification) => {
            return (notification.message !== message);
        });
        this._notifications = notifications;
    }

    @action
    public removeNotifications() {
        this._notifications = [];
    }
}

const observableNotificationStore = new NotificationStore();

export default observableNotificationStore;
