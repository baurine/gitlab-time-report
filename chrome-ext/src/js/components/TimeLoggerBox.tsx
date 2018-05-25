import * as React from 'react'

import { firebaseDb } from '../utils/firebase'
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
        .where('issueDocId', '==', 'aaaa')
        .orderBy('createdAt')
        .onSnapshot(
          (snapshot: any) => {
            let timeLogs:Array<ITimeLogDoc> = []
            snapshot.forEach((doc: any) => timeLogs.push({
              ...doc.data(),
              createdAt: doc.data().createdAt.toDate(),
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

  submitForm = (event: any) => {
    event.preventDefault()

    const { spentTime, timeLogs } = this.state
    const timeStr = spentTime.trim()
    if (timeStr === '') {
      return
    }

    const timeInt = parseInt(timeStr)
    const timeLog: ITimeLog = {
      spentTime: timeInt,
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
          <button>Add</button>
        </form>
      </div>
    )
  }
}
