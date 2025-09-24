import { action, computed, observable } from 'mobx'
import TransitType from '~/enums/transitType'
import LocalStorageHelper from '~/helpers/LocalStorageHelper'

class UserStore {
  @observable private _userTransitType: TransitType

  constructor() {
    const savedUserTransitType = LocalStorageHelper.getItem('user_transit_type')
    this._userTransitType = savedUserTransitType ? savedUserTransitType : TransitType.BUS
  }

  @computed
  get userTransitType() {
    return this._userTransitType
  }

  @action
  public setUserTransitType(userType: TransitType) {
    this._userTransitType = userType
    LocalStorageHelper.setItem('user_transit_type', userType)
  }
}

export default new UserStore()

export { UserStore }
