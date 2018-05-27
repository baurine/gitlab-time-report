import * as React from 'react'

import { firebaseDb } from '../firebase/firebase'
import DateUtil from '../utils/date-util'
import TimeLogItem from './TimeLogItem'
import TimeLogEditor from './TimeLogEditor'
import { ITimeLog,
         ITimeLogDetail,
         ITimeLogDoc,
         ITimeLoggerBoxState } from '../types/interfaces'
require('../../css/TimeLoggerBox.scss')

export default class TimeLoggerBox extends React.Component<{}, ITimeLoggerBoxState> {
  private unsubscribe: () => void

  constructor(props: {}) {
    super(props)
    this.state = {
      timeLogs: [],
    }
  }

  componentDidMount() {
    this.loadTimeLogs()
    // fetch('/ekohe/podknife/edit', {credentials: 'include'})
    //   .then(res => res.text())
    //   .then(data => console.log(data))
    //   .catch(err=>console.log(err))
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  loadTimeLogs() {
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

  addTimeLog = (timeLog: ITimeLog) => {
    const timeLogDetail: ITimeLogDetail = {
      ...timeLog,
      gitlabUser: 'baurine',
      issueDocId: 'aaaa',
      projectDocId: 'bbbb',
      createdAt: new Date(),
    }
    firebaseDb.collection('time-logs')
      .add(timeLogDetail)
      .then((docRef: any) => console.log(docRef.id))
      .catch((err: Error) => console.log(err.message))
  }

  deleteTimeLog = (timeLog: ITimeLogDoc) => {
    firebaseDb.collection('time-logs')
              .doc(timeLog.docId)
              .delete()
              .then(() => console.log('delete ok'))
              .catch((err: Error) => console.log(err.message))
  }

  updateTimeLog = (timeLog: ITimeLogDoc) => {
    firebaseDb.collection('time-logs')
              .doc(timeLog.docId)
              .set({
                spentTime: timeLog.spentTime,
                spentAt: timeLog.spentAt
              }, {merge: true})
              .then(() => console.log('update ok'))
              .catch((err: Error) => console.log(err.message))
  }

  renderTimeLogs = () => {
    return this.state.timeLogs.map(item =>
      <TimeLogItem key={item.docId}
                   timeLog={item}
                   onDelete={this.deleteTimeLog}
                   onUpdate={this.updateTimeLog}/>
    )
  }

  render() {
    return (
      <div className='time-logger-container'>
        { this.renderTimeLogs() }
        <br/>
        <TimeLogEditor onAdd={this.addTimeLog}/>
      </div>
    )
  }
}
