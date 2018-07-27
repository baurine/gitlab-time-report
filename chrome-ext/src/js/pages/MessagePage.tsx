import * as React from 'react'

require('../../css/common.scss')
import FlashMessage from '../components/FlashMessage'

type Props = {
  message: string
}

const MessagePage = ({message}: Props) =>
  <div className='message-page gtr-container'>
    <FlashMessage message={message}/>
  </div>

export default MessagePage
