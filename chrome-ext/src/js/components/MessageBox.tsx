import * as React from 'react'

require('../../css/MessageBox.scss')

const MessageBox = (props: {message?: string, onClose?: ()=>void}) => {
  const { message, onClose } = props

  if (message && onClose) {
    setTimeout(onClose, 5000)
  }
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

export default MessageBox
