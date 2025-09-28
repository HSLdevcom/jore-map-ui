import classnames from 'classnames'
import { observer } from 'mobx-react'
import React from 'react'
import * as s from './loader.scss'

type loaderSize = 'tiny' | 'small' | 'medium'

interface ILoaderProps {
  size?: loaderSize // defaults to medium
  hasNoMargin?: boolean
  containerClassName?: string
}

const Loader = observer((props: ILoaderProps) => (
  <div
    className={classnames(
      s.loaderContainer,
      s[props.size! || 'medium'],
      props.hasNoMargin ? s.hasNoMargin : undefined,
      props.containerClassName ? props.containerClassName : undefined
    )}
  >
    <div
      data-cy="loader"
      className={classnames(
        s.loader,
        s[props.size! || 'medium'],
        props.hasNoMargin ? s.hasNoMargin : undefined
      )}
    />
  </div>
))

export default Loader
