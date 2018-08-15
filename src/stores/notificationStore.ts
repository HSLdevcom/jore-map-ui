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
    public addNotifications(notifications: INotification[]) {
        const currentMessages = this._notifications.map((notification: INotification) => {
            return notification.message;
        });

        const newNotifications = notifications.filter((notification: INotification) => {
            return (!currentMessages.includes(notification.message));
        });

        this._notifications = this._notifications.concat(newNotifications);
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
