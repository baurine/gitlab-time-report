import * as React from 'react'

import { ITimeLoggerItemProps } from './interfaces'

export default class TimeLoggerItem extends React.Component<ITimeLoggerItemProps, any> {
  constructor(props: ITimeLoggerItemProps) {
    super(props)
    this.state = {
      inEdit: false,
      spentTime: ''
    }
  }

  clickDelte = () => {
    const { onDelete } = this.props
    onDelete && onDelete(this.props.timeLogger)
  }

  clickEdit = () => {
    this.setState({
      inEdit: true,
      spentTime: this.props.timeLogger.spentTime
    })
  }

  submitUpdate = (event: any) => {
    event.preventDefault()

    const time = this.state.spentTime.trim()
    if (time === '') {
      return
    }

    let newTimeLogger = Object.assign({}, this.props.timeLogger)
    newTimeLogger.spentTime = time

    const { onUpdate } = this.props
    onUpdate && onUpdate(newTimeLogger)

    this.setState({
      inEdit: false
    })
  }

  clickCancel = (event: any) => {
    event.preventDefault()

    this.setState({
      inEdit: false,
      spentTime: ''
    })
  }

  textChange = (event: any) => {
    this.setState({spentTime: event.target.value})
  }

  renderEditStaus() {
    const { timeLogger } = this.props
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
    const { timeLogger } = this.props

    return (
      <div>
        <span>{timeLogger.spentTime}</span>
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
