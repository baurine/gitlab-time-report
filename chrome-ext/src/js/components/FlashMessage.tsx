import * as React from 'react'

require('../../css/FlashMessage.scss')

const FlashMessage = (props: {message?: string, onClose?: ()=>void}) => {
  const { message, onClose } = props

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
