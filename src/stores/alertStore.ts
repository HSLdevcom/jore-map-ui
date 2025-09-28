import { action, computed, observable } from 'mobx'
import constants from '~/constants/constants'

enum AlertType {
  Success = 1,
  Info,
  Loader,
}

const DEFAULT_CLOSE_BUTTON_TEXT = 'OK'

class AlertStore {
  @observable private _message: string | null
  @observable private _type: AlertType | null
  @observable private _isCancelButtonVisible: boolean
  @observable private _closeButtonText: string
  private _onClose: null | (() => void)

  constructor() {
    this._message = null
    this._isCancelButtonVisible = false
    this._closeButtonText = DEFAULT_CLOSE_BUTTON_TEXT
  }

  @computed
  get message() {
    return this._message
  }

  @computed
  get type() {
    return this._type
  }

  @computed
  get isCancelButtonVisible() {
    return this._isCancelButtonVisible
  }

  @computed
  get isAlertOpen(): boolean {
    return this._message !== null
  }

  @computed
  get closeButtonText(): string {
    return this._closeButtonText
  }

  @action
  public setNotificationMessage = ({
    message,
    onClose,
    closeButtonText,
    type = AlertType.Success,
  }: {
    message: string
    onClose?: () => void
    closeButtonText?: string
    type?: AlertType
  }) => {
    this._message = message
    this._isCancelButtonVisible = true
    this._onClose = onClose ? onClose : null
    this._closeButtonText = closeButtonText ? closeButtonText : DEFAULT_CLOSE_BUTTON_TEXT
    this._type = type
  }

  @action
  public setFadeMessage = ({
    message,
    type = AlertType.Success,
  }: {
    message: string
    type?: AlertType
  }) => {
    this._message = message
    this._type = type

    return new Promise((resolve) => {
      setTimeout(() => {
        this.close()
        resolve()
      }, constants.FADE_ALERT_TIMEOUT)
    })
  }

  @action
  public setLoaderMessage = (message: string) => {
    this._message = message
    this._type = AlertType.Loader
  }

  @action
  public close = () => {
    if (this._onClose) {
      this._onClose()
    }
    this._message = null
    this._type = null
    this._isCancelButtonVisible = false
    this._onClose = null
    this._closeButtonText = DEFAULT_CLOSE_BUTTON_TEXT
  }
}

export default new AlertStore()

export { AlertStore, AlertType }
