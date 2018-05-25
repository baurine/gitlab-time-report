import * as React from 'react'

import { firebase, firebaseDb } from '../utils/firebase'
import { ITimeLog, ITimeLogDoc, ITimeLoggerBoxState } from './interfaces'
import TimeLogItem from './TimeLogItem'
require('../../css/TimeLoggerBox.scss')

export default class TimeLoggerBox extends React.Component<{}, ITimeLoggerBoxState> {
  private unsubscribe: () => void

  constructor(props: {}) {
    super(props)
    this.state = {
      spentTime: '',
      timeLogs: []
    }
  }

  componentDidMount() {
    this.unsubscribe =
      firebaseDb.collection('time-logs')
        .onSnapshot(
          (snapshot: any) => {
            let timeLogs:Array<ITimeLogDoc> = []
            snapshot.forEach((doc: any) => timeLogs.push({
              docId: doc.id,
              ...doc.data()
            }))
            this.setState({timeLogs})
          },
          (err: Error) => {
            console.log(err.message)
          }
        )
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  textChange = (event: any) => {
    this.setState({spentTime: event.target.value})
  }

  submitForm = (event: any) => {
    event.preventDefault()

    const { spentTime, timeLogs } = this.state

    const timeStr = spentTime.trim()
    if (timeStr === '') {
      return
    }

    const timeInt = parseInt(timeStr)
    const timeLog = {spentTime: timeInt, createdAt: new Date()}
    const newTimeLogs = timeLogs.concat(timeLog)
    this.setState({timeLogs: newTimeLogs, spentTime: ''})

    firebaseDb.collection('time-logs')
      .add(timeLog)
      .then((docRef:any) => console.log(docRef.id))
      .catch((err:Error) => console.log(err.message))
  }

  deleteItem = (timeLog: ITimeLog) => {
    const { timeLogs } = this.state
    const newTimeLogs = timeLogs.filter(item => item.createdAt !== timeLog.createdAt)
    this.setState({timeLogs: newTimeLogs})
  }

  updateItem = (timeLog: ITimeLog) => {
    let newTimeLogs = Object.assign([], this.state.timeLogs)
    newTimeLogs.forEach(item => {
      if (item.createdAt === timeLog.createdAt) {
        item.spentTime = timeLog.spentTime
      }
    })
    this.setState({timeLogs: newTimeLogs})
  }

  renderTimeLogs = () => {
    return this.state.timeLogs.map(item =>
      <TimeLogItem key={item.createdAt.valueOf()}
                   timeLog={item}
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
        { this.renderTimeLogs() }
      </div>
    )
  }
}
