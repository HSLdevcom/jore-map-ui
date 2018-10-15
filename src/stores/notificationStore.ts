import { action, computed, observable } from 'mobx';
import NotificationType from '~/enums/notificationType';
import HashHelper from '../util/hashHelper';

interface INotification {
    message: string;
    type: NotificationType;
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
        const notificationHash = HashHelper.getHashFromString(notification.message);
        if (this._notifications
            .filter(n =>
                HashHelper.getHashFromString(n.message) === notificationHash,
            ).length === 0) {
            this._notifications.push(notification);
        }
    }

    @action
    public closeNotification(message: string) {
        this._notifications = this._notifications.filter((notification: INotification) => {
            return (notification.message !== message);
        });
    }

    @action
    public removeNotifications() {
        this._notifications = [];
    }
}

const observableNotificationStore = new NotificationStore();

export default observableNotificationStore;
