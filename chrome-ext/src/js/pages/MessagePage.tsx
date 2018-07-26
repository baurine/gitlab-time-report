import * as React from 'react'

import FlashMessage from '../components/FlashMessage'
require('../../css/common.scss')

type Props = {
  message: string
}

const MessagePage = ({message}: Props) =>
  <div className='message-page gtr-container'>
    <FlashMessage message={message}/>
  </div>

export default MessagePage
