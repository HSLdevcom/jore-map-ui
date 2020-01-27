import { action, computed, observable } from 'mobx';
import TransitType from '~/enums/transitType';
import LocalStorageHelper from '~/helpers/LocalStorageHelper';

export class UserStore {
    @observable private _userTransitType: TransitType;

    constructor() {
        const savedUserTransitType = LocalStorageHelper.getItem('userTransitType');
        this._userTransitType = savedUserTransitType ? savedUserTransitType : TransitType.BUS;
    }

    @computed
    get userTransitType() {
        return this._userTransitType;
    }

    @action
    public setUserTransitType(userType: TransitType) {
        this._userTransitType = userType;
        LocalStorageHelper.setItem('userTransitType', userType);
    }
}

const observableUserStore = new UserStore();

export default observableUserStore;
