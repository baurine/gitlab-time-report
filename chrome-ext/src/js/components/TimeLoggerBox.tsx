import * as React from 'react'

import { firebaseDb } from '../utils/firebase'
import DateUtil from '../utils/date-util'
import { ITimeLog, ITimeLogDoc, ITimeLoggerBoxState } from './interfaces'
import TimeLogItem from './TimeLogItem'
require('../../css/TimeLoggerBox.scss')

export default class TimeLoggerBox extends React.Component<{}, ITimeLoggerBoxState> {
  private unsubscribe: () => void
  private todayDate: string

  constructor(props: {}) {
    super(props)
    this.todayDate = DateUtil.getDayFormat(new Date())
    this.state = {
      spentTime: '',
      spentAt: this.todayDate,
      timeLogs: [],
    }
  }

  componentDidMount() {
    this.unsubscribe =
      firebaseDb.collection('time-logs')
        .where('issueDocId', '==', 'aaaa')
        .orderBy('createdAt')
        .onSnapshot(
          (snapshot: any) => {
            let timeLogs:Array<ITimeLogDoc> = []
            snapshot.forEach((doc: any) => timeLogs.push({
              ...doc.data(),
              createdAt: doc.data().createdAt.toDate(),
              spentAt: doc.data().spentAt.toDate(),
              docId: doc.id,
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

  dateChange = (event: any) => {
    this.setState({spentAt: event.target.value})
  }

  submitForm = (event: any) => {
    event.preventDefault()

    const { spentTime, spentAt, timeLogs } = this.state
    const timeStr = spentTime.trim()
    if (timeStr === '') {
      return
    }
    const timeInt = parseInt(timeStr)
    if (isNaN(timeInt) || timeInt < 0) {
      return
    }

    const timeLog: ITimeLog = {
      spentTime: timeInt,
      spentAt: new Date(spentAt),
      createdAt: new Date(),
      user: 'baurine',
      issueDocId: 'aaaa',
      projectDocId: 'bbbb'
    }
    this.setState({spentTime: ''})

    firebaseDb.collection('time-logs')
      .add(timeLog)
      .then((docRef: any) => console.log(docRef.id))
      .catch((err: Error) => console.log(err.message))
  }

  deleteItem = (timeLog: ITimeLogDoc) => {
    const { timeLogs } = this.state
    const newTimeLogs = timeLogs.filter(item => item.docId !== timeLog.docId)
    this.setState({timeLogs: newTimeLogs})

    firebaseDb.collection('time-logs')
              .doc(timeLog.docId)
              .delete()
              .then(() => console.log('delete ok'))
              .catch((err: Error) => console.log(err.message))
  }

  updateItem = (timeLog: ITimeLogDoc) => {
    firebaseDb.collection('time-logs')
              .doc(timeLog.docId)
              .set({spentTime: timeLog.spentTime}, {merge: true})
              .then(() => console.log('update ok'))
              .catch((err: Error) => console.log(err.message))
  }

  renderTimeLogs = () => {
    return this.state.timeLogs.map(item =>
      <TimeLogItem key={item.docId}
                   timeLog={item}
                   onDelete={this.deleteItem}
                   onUpdate={this.updateItem}/>
    )
  }

  render() {
    return (
      <div className='time-logger-container'>
        { this.renderTimeLogs() }
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
      </div>
    )
  }
}
