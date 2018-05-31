import * as React from 'react'
const md5 = require('blueimp-md5')

import CommonUtil from '../utils/common-util'
import DateUtil from '../utils/date-util'
import { firebaseDb, dbCollections } from '../firebase/firebase'
import TimeLogItem from './TimeLogItem'
import TimeLogEditor from './TimeLogEditor'
import MessageBox from './MessageBox'
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
      issueDoc: null,
      message: ''
    }
  }

  componentDidMount() {
    this.findOrCreateIssue()
      .then((issueDoc: any) => {
        this.setState({issueDoc}, () => {
          this.loadTimeLogs()
          this.updateIssueDoc()
          this.findOrCreateProject()
        })
      })
      .catch((err: any) => {
        this.setState({message: CommonUtil.formatFirebaseError(err)})
      })
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe()
  }

  findOrCreateIssue() {
    const { curIssue } = this.props.issuePageInfo
    const issueSignature =
      `${curIssue.type}-${curIssue.num}-${curIssue.createdBy}-${curIssue.issueCreatedAt}`
    const issueMD5 = md5(issueSignature)
    const issueDocRef = firebaseDb.collection(dbCollections.ISSUES).doc(issueMD5)
    return issueDocRef.get()
      .then((snapshot: any)=>{
        if(snapshot.exists) {
          CommonUtil.log('issue existed')
          return {
            ...snapshot.data(),
            issueCreatedAt: snapshot.data().issueCreatedAt.toDate(),
            docId: snapshot.id,
          }
        } else {
          // add
          return issueDocRef.set(curIssue)
            .then(() => {
              CommonUtil.log('add issue ok')
              return {
                docId: issueMD5,
                ...curIssue
              }
            })
        }
      })
  }

  updateIssueDoc() {
    const { curIssue } = this.props.issuePageInfo
    const { issueDoc } = this.state
    if (issueDoc.title !== curIssue.title ||
        issueDoc.project !== curIssue.project) {
      firebaseDb.collection(dbCollections.ISSUES)
        .doc(issueDoc.docId)
        .update({
          title: curIssue.title,
          proect: curIssue.project
        })
        .then(() => CommonUtil.log('update issue ok'))
        .catch(CommonUtil.handleError)
    }
  }

  findOrCreateProject() {
    const { curIssue } = this.props.issuePageInfo
    const projectSignMD5 = md5(curIssue.project)
    const projectDocRef = firebaseDb.collection(dbCollections.PROJECTS).doc(projectSignMD5)
    projectDocRef.get()
      .then((snapshot: any)=>{
        if (snapshot.exists) {
          throw new Error('project existed')
        } else {
          return projectDocRef.set({name: curIssue.project})
        }
      })
      .then(() => CommonUtil.log('add project ok'))
      .catch(CommonUtil.handleError)
  }

  loadTimeLogs() {
    const { issueDoc } = this.state
    this.unsubscribe =
      firebaseDb.collection(dbCollections.TIME_LOGS)
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
          (err: any) => {
            this.setState({message: CommonUtil.formatFirebaseError(err)})
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
    firebaseDb.collection(dbCollections.TIME_LOGS)
      .add(timeLogDetail)
      .then(() => this.setState({message: 'add timelog ok'}))
      .catch((err: any) => {
        this.setState({message: CommonUtil.formatFirebaseError(err)})
      })
  }

  deleteTimeLog = (timeLog: ITimeLogDoc) => {
    if (confirm('Are you sure to delete this timelog?')) {
      firebaseDb.collection(dbCollections.TIME_LOGS)
                .doc(timeLog.docId)
                .delete()
                .then(() => this.setState({message: 'delete timelog ok'}))
                .catch((err: any) => {
                  this.setState({message: CommonUtil.formatFirebaseError(err)})
                })
    }
  }

  updateTimeLog = (timeLog: ITimeLogDoc) => {
    firebaseDb.collection(dbCollections.TIME_LOGS)
              .doc(timeLog.docId)
              .update({
                spentTime: timeLog.spentTime,
                spentAt: timeLog.spentAt
              })
              .then(() => this.setState({message: 'update timelog ok'}))
              .catch((err: any) => {
                this.setState({message: CommonUtil.formatFirebaseError(err)})
              })
  }

  renderTimeLogs = () => {
    const { curGitlabUser } = this.props.issuePageInfo
    return this.state.timeLogs.map(item =>
      <TimeLogItem key={item.docId}
                   timeLog={item}
                   enableEdit={item.gitlabUser===curGitlabUser}
                   onDelete={this.deleteTimeLog}
                   onUpdate={this.updateTimeLog}/>
    )
  }

  render() {
    const { message } = this.state
    return (
      <div className='time-logger-container'>
        { this.renderTimeLogs() }
        <br/>
        <MessageBox message={message}
                    onClose={()=>this.setState({message: ''})}/>
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
