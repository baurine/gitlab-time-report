import * as React from 'react'

import { ITimeLogItemProps } from './interfaces'

export default class TimeLogItem extends React.Component<ITimeLogItemProps, any> {
  constructor(props: ITimeLogItemProps) {
    super(props)
    this.state = {
      inEdit: false,
      spentTime: ''
    }
  }

  clickDelte = () => {
    const { onDelete, timeLog } = this.props
    onDelete && onDelete(timeLog)
  }

  clickEdit = () => {
    const { timeLog } = this.props
    this.setState({
      inEdit: true,
      spentTime: timeLog.spentTime
    })
  }

  clickCancel = (event: any) => {
    event.preventDefault()

    this.setState({
      inEdit: false,
      spentTime: ''
    })
  }

  submitUpdate = (event: any) => {
    event.preventDefault()

    const { spentTime } = this.state
    const time = spentTime.trim()
    if (time === '') {
      return
    }

    const { onUpdate, timeLog } = this.props
    const newTime = parseInt(time)
    const newTimeLog = {
      spentTime: newTime,
      ...timeLog
    }
    onUpdate && onUpdate(newTimeLog)

    this.setState({
      inEdit: false
    })
  }

  textChange = (event: any) => {
    this.setState({spentTime: event.target.value})
  }

  renderEditStaus() {
    const { timeLog } = this.props
    const { spentTime } = this.state

    return (
      <form onSubmit={this.submitUpdate}>
        <input type='text'
               value={spentTime}
               onChange={this.textChange}/>
        <button>Update</button>
        <button onClick={this.clickCancel}>Cancel</button>
      </form>
    )
  }

  renderDisplayStatus() {
    const { timeLog } = this.props

    return (
      <div>
        <span>{timeLog.spentTime}</span>
        <button onClick={this.clickEdit}>Edit</button>
        <button onClick={this.clickDelte}>x</button>
      </div>
    )
  }

  render() {
    return this.state.inEdit ?
           this.renderEditStaus() :
           this.renderDisplayStatus()
  }
}
