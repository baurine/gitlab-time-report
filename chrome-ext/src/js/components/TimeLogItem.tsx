import * as React from 'react'

import DateUtil from '../utils/date-util'
import TimeLogEditor from './TimeLogEditor'
import { ITimeLogItemProps,
         ITimeLogDoc } from '../types'

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
    const { timeLog, enableEdit } = this.props

    return (
      <div className='time-log-item'>
        <span className='time-log-desc'><a href={`/${timeLog.gitlabUser}`}>@{timeLog.gitlabUser}</a> spent {DateUtil.formatSpentTime(timeLog.spentTime)} of time at {DateUtil.getDayFormat(timeLog.spentAt)}</span>
        {
          enableEdit &&
          <span className='time-log-btns'>
            <a onClick={this.clickEdit}>Edit</a>
            <a onClick={this.clickDelte}>Delete</a>
          </span>
        }
      </div>
    )
  }

  render() {
    return this.state.editing ?
           this.renderEditStaus() :
           this.renderDisplayStatus()
  }
}
