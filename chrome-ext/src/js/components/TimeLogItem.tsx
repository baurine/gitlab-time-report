import * as React from 'react'

import { ITimeLogItemProps, ITimeLogDoc } from './interfaces'
import TimeLogEditor from './TimeLogEditor'
import DateUtil from '../utils/date-util'

export default class TimeLogItem extends React.Component<ITimeLogItemProps, {editing: boolean}> {
  constructor(props: ITimeLogItemProps) {
    super(props)
    this.state = {
      editing: false,
    }
  }

  clickEdit = () => {
    this.setState({
      editing: true,
    })
  }

  cancelEdit = () => {
    this.setState({
      editing: false,
    })
  }

  updateItem = (timeLog: ITimeLogDoc) => {
    const { onUpdate } = this.props
    onUpdate && onUpdate(timeLog)

    this.setState({
      editing: false
    })
  }

  clickDelte = () => {
    const { onDelete, timeLog } = this.props
    onDelete && onDelete(timeLog)
  }

  renderEditStaus() {
    const { timeLog } = this.props

    return (
      <TimeLogEditor timeLog={timeLog}
                     onUpdate={this.updateItem}
                     onCancel={this.cancelEdit}/>
    )
  }

  renderDisplayStatus() {
    const { timeLog } = this.props

    return (
      <div>
        <span>{timeLog.user} spent {timeLog.spentTime} mins at {DateUtil.getDayFormat(timeLog.spentAt)}</span>
        <button onClick={this.clickEdit}>Edit</button>
        <button onClick={this.clickDelte}>x</button>
      </div>
    )
  }

  render() {
    return this.state.editing ?
           this.renderEditStaus() :
           this.renderDisplayStatus()
  }
}
