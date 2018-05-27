import * as React from 'react'

import DateUtil from '../utils/date-util'
import { ITimeLog,
         ITimeLogDoc,
         ITimeLogEditorProps,
         ITimeLogEditorState } from '../types'

export default class TimeLogEditor extends React.Component<ITimeLogEditorProps, ITimeLogEditorState> {
  private todayDay: string

  constructor(props: ITimeLogEditorProps) {
    super(props)
    this.todayDay = DateUtil.getDayFormat(new Date())
    let spentTime: string, spentAt: string
    if (props.timeLog) {
      spentTime = props.timeLog.spentTime + ''
      spentAt = DateUtil.getDayFormat(props.timeLog.spentAt)
    } else {
      spentTime = ''
      spentAt = this.todayDay
    }
    this.state = {
      spentTime,
      spentAt
    }
  }

  textChange = (event: any) => {
    this.setState({spentTime: event.target.value})
  }

  dateChange = (event: any) => {
    this.setState({spentAt: event.target.value})
  }

  submitForm = (event: any) => {
    event.preventDefault()

    const { spentTime, spentAt } = this.state
    const timeStr = spentTime.trim()
    if (timeStr === '') {
      return
    }
    const timeInt = parseInt(timeStr)
    if (isNaN(timeInt) || timeInt <= 0) {
      return
    }

    const { timeLog, onUpdate, onAdd } = this.props
    const newTimeLog: ITimeLog = {
      spentTime: timeInt,
      spentAt: new Date(spentAt),
    }
    if (timeLog) {
      onUpdate && onUpdate({
        ...timeLog,
        ...newTimeLog
      })
    } else {
      onAdd && onAdd(newTimeLog)
    }

    this.setState({spentTime: ''})
  }

  clickCancel = (event: any) => {
    const { onCancel } = this.props
    onCancel && onCancel()
  }

  render() {
    const { spentTime, spentAt } = this.state
    const { timeLog } = this.props
    return (
      <form onSubmit={this.submitForm}>
        <input type='text'
               value={spentTime}
               placeholder='format: 1h 30m'
               onChange={this.textChange}/>
        <input type='date'
               value={spentAt}
               max={this.todayDay}
               onChange={this.dateChange}/>
        {
          timeLog ?
          <div>
            <button>Update</button>
            <button onClick={this.clickCancel}>Cancel</button>
          </div> :
          <button>Add</button>
        }
      </form>
    )
  }
}
