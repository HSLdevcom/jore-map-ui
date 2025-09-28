import { action, computed, observable } from 'mobx'

class ModalStore {
  private _content: React.ReactNode
  @observable private _isOpen: boolean

  constructor() {
    this._content = null
    this._isOpen = false
  }

  @computed
  get isOpen(): boolean {
    return this._isOpen
  }

  @computed
  get content() {
    return this._content
  }

  @action
  public openModal = ({ content }: { content: React.ReactNode | string }) => {
    this._content = content
    this._isOpen = true
  }

  @action
  public closeModal = () => {
    this.clear()
  }

  @action
  private clear = () => {
    this._content = null
    this._isOpen = false
  }
}

export default new ModalStore()

export { ModalStore }
