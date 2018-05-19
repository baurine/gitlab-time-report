import * as React from 'react'

import { ITimeLoggerItemProps } from './interfaces'

export default class TimeLoggerItem extends React.Component<ITimeLoggerItemProps, any> {

  clickDelte = () => {
    const { onDelete } = this.props
    onDelete && onDelete(this.props.timeLogger)
  }

  render() {
    const { timeLogger } = this.props

    return (
      <div>
        <span>{timeLogger.spentTime}</span>
        <button>Edit</button>
        <button onClick={this.clickDelte}>x</button>
      </div>
    )
  }

}
