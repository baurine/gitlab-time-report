import * as React from 'react'

import { firebaseDb } from '../firebase/firebase'
import DateUtil from '../utils/date-util'
import TimeLogItem from './TimeLogItem'
import TimeLogEditor from './TimeLogEditor'
import { ITimeLog,
         ITimeLogDetail,
         ITimeLogDoc,
         IIssueDoc,
         ITimeLoggerBoxProps,
         ITimeLoggerBoxState } from '../types'
require('../../css/TimeLoggerBox.scss')

class TimeLoggerBox extends React.Component<ITimeLoggerBoxProps, ITimeLoggerBoxState> {
  private unsubscribe: () => void

  constructor(props: ITimeLoggerBoxProps) {
    super(props)
    this.state = {
      timeLogs: [],
      issueDoc: null
    }
  }

  componentDidMount() {
    this.findOrCreateIssue()
      .then((issueDoc: any)=>{
        this.setState({issueDoc}, ()=>{
          this.loadTimeLogs()
          this.updateIssueDoc()
          this.findOrCreateProject()
        })
      })
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe()
  }

  findOrCreateIssue() {
    const { curIssue } = this.props.issuePageInfo
    return firebaseDb.collection('issues')
      .where('type', '==', curIssue.type)
      .where('num', '==', curIssue.num)
      .where('createdBy', '==', curIssue.createdBy)
      .where('issueCreatedAt', '==', curIssue.issueCreatedAt)
      .limit(1)
      .get()
      .then((snapshot: any) => {
          let issueSnapshot: any
          snapshot.forEach((s: any)=>issueSnapshot=s)
          if (issueSnapshot) {
            return {
              ...issueSnapshot.data(),
              issueCreatedAt: issueSnapshot.data().issueCreatedAt.toDate(),
              docId: issueSnapshot.id,
            }
          } else {
            // add
            return firebaseDb.collection('issues')
              .add(curIssue)
              .then((docRef: any) => ({
                docId: docRef.id,
                ...curIssue
              }))
          }
      })
      .catch((err: Error)=>console.log(err.message))
  }

  updateIssueDoc() {
    const { curIssue } = this.props.issuePageInfo
    const { issueDoc } = this.state
    if (issueDoc.title !== curIssue.title ||
        issueDoc.project !== curIssue.project) {
      firebaseDb.collection('issues')
        .doc(issueDoc.docId)
        .update({
          title: curIssue.title,
          proect: curIssue.project
        })
        .then(()=>console.log('update issue ok'))
        .catch((err: Error)=>console.log(err.message))
    }
  }

  findOrCreateProject() {
    const { curIssue } = this.props.issuePageInfo
    firebaseDb.collection('projects')
      .where('name', '==', curIssue.project)
      .limit(1)
      .get()
      .then((snapshot: any) => {
        if (snapshot.empty) {
          return firebaseDb.collection('projects')
            .add({name: curIssue.project})
        } else {
          throw new Error('project existed')
        }
      })
      .then(()=>console.log('save project ok'))
      .catch((err: Error)=>console.log(err.message))
  }

  loadTimeLogs() {
    const { issueDoc } = this.state
    this.unsubscribe =
      firebaseDb.collection('time-logs')
        .where('issueDocId', '==', issueDoc.docId)
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
    const { issueDoc } = this.state
    const timeLogDetail: ITimeLogDetail = {
      ...timeLog,
      gitlabUser: issuePageInfo.curGitlabUser,
      issueDocId: issueDoc.docId,
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
              .update({
                spentTime: timeLog.spentTime,
                spentAt: timeLog.spentAt
              })
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
        {
          this.state.issueDoc &&
          <TimeLogEditor onAdd={this.addTimeLog}/>
        }
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
