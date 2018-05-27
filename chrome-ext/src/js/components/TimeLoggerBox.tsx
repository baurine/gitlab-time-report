import * as React from 'react'

import { firebaseDb } from '../firebase/firebase'
import DateUtil from '../utils/date-util'
import TimeLogItem from './TimeLogItem'
import TimeLogEditor from './TimeLogEditor'
import { ITimeLog,
         ITimeLogDetail,
         ITimeLogDoc,
         ITimeLoggerBoxProps,
         ITimeLoggerBoxState } from '../types'
require('../../css/TimeLoggerBox.scss')

class TimeLoggerBox extends React.Component<ITimeLoggerBoxProps, ITimeLoggerBoxState> {
  private unsubscribe: () => void

  constructor(props: ITimeLoggerBoxProps) {
    super(props)
    this.state = {
      timeLogs: [],
    }
  }

  componentDidMount() {
    this.loadTimeLogs()
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
    const { issuePageInfo } = this.props
    const timeLogDetail: ITimeLogDetail = {
      ...timeLog,
      gitlabUser: issuePageInfo.curGitlabUser,
      issueDocId: 'aaaa',
      project: issuePageInfo.curIssue.project,
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

////////////////////////////////

import { IssuePageContext } from '../contexts'
import { IIssuePageInfo } from '../types'

const TimeLoggerBoxWrapper = (props: {}) =>
  <IssuePageContext.Consumer>
    {
      (issuePageInfo: IIssuePageInfo) =>
      <TimeLoggerBox 
        issuePageInfo={issuePageInfo}
        {...props}/>
    }
  </IssuePageContext.Consumer>

export default TimeLoggerBoxWrapper
