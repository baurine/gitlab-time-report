import * as React from 'react'

import TimeLoggerItem from './TimeLoggerItem'
import { firebase, firebaseDb } from '../utils/firebase'
import { ITimeLogger, ITimeLoggerBoxState } from './interfaces'
require('../../css/TimeLoggerBox.scss')

let idCounter = 1

export default class TimeLoggerBox extends React.Component<{}, ITimeLoggerBoxState> {
  constructor(props: {}) {
    super(props)
    this.state = {
      spentTime: '',
      timeLoggers: []
    }
  }

  textChange = (event: any) => {
    this.setState({spentTime: event.target.value})
  }

  submitForm = (event: any) => {
    event.preventDefault()

    const { spentTime, timeLoggers } = this.state

    const time = spentTime.trim()
    if (time === '') {
      return
    }
    const timeLogger = {id: idCounter++, spentTime: time}
    const newTimeLoggers = timeLoggers.concat(timeLogger)
    this.setState({timeLoggers: newTimeLoggers, spentTime: ''})
  }

  deleteItem = (timeLogger: ITimeLogger) => {
    const { timeLoggers } = this.state
    const newTimeLoggers = timeLoggers.filter(item => item.id !== timeLogger.id)
    this.setState({timeLoggers: newTimeLoggers})
  }

  updateItem = (timeLogger: ITimeLogger) => {
    let newTimeLoggers = Object.assign([], this.state.timeLoggers)
    newTimeLoggers.forEach(item => {
      if (item.id === timeLogger.id) {
        item.spentTime = timeLogger.spentTime
      }
    })
    this.setState({timeLoggers: newTimeLoggers})
  }

  renderLoggers = () => {
    return this.state.timeLoggers.map(item =>
      <TimeLoggerItem timeLogger={item}
                      key={item.id}
                      onDelete={this.deleteItem}
                      onUpdate={this.updateItem}/>
    )
  }

  render() {
    return (
      <div className='time-logger-container'>
        <form onSubmit={this.submitForm}>
          <input type='text'
                 value={this.state.spentTime}
                 placeholder='format: 1h 30m'
                 onChange={this.textChange}/>
          <button>Add</button>
        </form>
        { this.renderLoggers() }
      </div>
    )
  }
}
