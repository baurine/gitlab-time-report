import * as React from 'react'

require('../../css/FlashMessage.scss')

type Props = {
  message?: string,
  onClose?: () => void
}

const FlashMessage = ({message, onClose}: Props) => {
  if (message) {
    return (
      <div className='flash-message-container'>
        {
          onClose &&
          <a className='close' onClick={onClose}>×</a>
        }
        <span>{message}</span>
      </div>
    )
  }
  return null
}

export default FlashMessage
