import * as React from 'react'

import DateUtil from '../utils/date-util'
import { ITimeLog, ITimeLogEditorProps, ITimeLogEditorState } from './interfaces'

export default class TimeLogEditor extends React.Component<ITimeLogEditorProps, ITimeLogEditorState> {
  private todayDate: string

  constructor(props: {}) {
    super(props)
    this.todayDate = DateUtil.getDayFormat(new Date())
    this.state = {
      spentTime: '',
      spentAt: this.todayDate,
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

    const timeLog: ITimeLog = {
      spentTime: timeInt,
      spentAt: new Date(spentAt),
      createdAt: new Date(),
    }
    const { onAdd } = this.props
    onAdd && onAdd(timeLog)

    this.setState({spentTime: ''})
  }

  render() {
    return (
      <form onSubmit={this.submitForm}>
        <input type='text'
               value={this.state.spentTime}
               placeholder='format: 1h 30m'
               onChange={this.textChange}/>
        <input type='date'
               value={this.state.spentAt}
               max={this.todayDate}
               onChange={this.dateChange}/>
        <button>Add</button>
      </form>
    )
  }
}
