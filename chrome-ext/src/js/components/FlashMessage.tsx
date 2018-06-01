import * as React from 'react'

require('../../css/FlashMessage.scss')

const FlashMessage = (props: {message?: string, onClose?: ()=>void}) => {
  const { message, onClose } = props

  if (message) {
    return (
      <div className='message-box-container'>
        <span className='message'>{message}</span>
        {
          onClose &&
          <a onClick={onClose}>X</a>
        }
      </div>
    )
  }
  return null
}

export default FlashMessage
