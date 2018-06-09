import * as React from 'react'

import FlashMessage from '../components/FlashMessage'
import { IMessagePageProps } from '../types'
require('../../css/common.scss')

export default class MessagePage extends React.Component<IMessagePageProps, {}> {
  render() {
    return (
      <div className='message-page gtr-container'>
        <FlashMessage message={this.props.message}/>
      </div>
    )
  }
}
