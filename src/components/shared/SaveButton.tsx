import classnames from 'classnames'
import { observer } from 'mobx-react'
import React from 'react'
import ButtonType from '~/enums/buttonType'
import AlertStore, { AlertType } from '~/stores/alertStore'
import LoginStore from '~/stores/loginStore'
import { Button } from '../controls'
import * as s from './saveButton.scss'

type SaveButtonType = 'saveButton' | 'warningButton' | 'deleteButton'

interface ISaveButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean // disabled save button can still be clicked to show savePreventedNotification
  type?: SaveButtonType
  className?: string
  title?: string
  savePreventedNotification: string
  isWide?: boolean
  hasPadding?: boolean // defaults to true
}

const SaveButton = observer((props: ISaveButtonProps) => {
  const {
    children,
    className,
    onClick,
    disabled,
    type = 'saveButton',
    title,
    savePreventedNotification,
    isWide,
    hasPadding,
    ...attrs
  } = props

  const isSaveLockEnabled = LoginStore.isSaveLockEnabled
  const isDisabled = disabled && savePreventedNotification.length === 0
  // Render button that shows a notification when clicked (save prevented)
  if (isSaveLockEnabled || savePreventedNotification.length > 0) {
    const typeClass =
      savePreventedNotification.length > 0
        ? s.savePreventedNotificationButton
        : s.warningButton
    return (
      // Render special button type for this situation (using duplicated <Button/> to simplify code)
      <Button
        {...attrs}
        className={classnames(s.saveButtonBase, typeClass, className ? className : undefined)}
        onClick={() => showSavePreventedNotification(savePreventedNotification)}
        disabled={isDisabled}
        type={ButtonType.SQUARE}
        isWide={isWide}
        hasPadding={typeof hasPadding === 'undefined' ? true : hasPadding}
        title={title ? title : ''}
        data-cy={attrs['data-cy'] ? attrs['data-cy'] : 'saveButton'}
      >
        {children}
      </Button>
    )
  }

  let typeClass
  if (isDisabled) {
    typeClass = undefined
  } else if (type === 'deleteButton') {
    typeClass = s.deleteButton
  } else if (type === 'warningButton') {
    typeClass = s.warningButton
  } else if (type === 'saveButton') {
    typeClass = s.saveButton
  }
  return (
    <Button
      {...attrs}
      className={classnames(s.saveButtonBase, typeClass, className ? className : undefined)}
      onClick={onClick}
      disabled={isDisabled}
      type={ButtonType.SQUARE}
      isWide={isWide}
      hasPadding={typeof hasPadding === 'undefined' ? true : hasPadding}
      title={title ? title : ''}
      data-cy={attrs['data-cy'] ? attrs['data-cy'] : 'saveButton'}
    >
      {children}
    </Button>
  )
})

const showSavePreventedNotification = (savePreventedNotification: string) => {
  const alertText = LoginStore.isSaveLockEnabled
    ? 'Tallentaminen estetty, infopoiminta on käynnissä. Odota kunnes infopoiminta loppuu.'
    : savePreventedNotification
  AlertStore.setNotificationMessage({
    message: alertText,
    type: AlertType.Info,
  })
}

export default SaveButton
