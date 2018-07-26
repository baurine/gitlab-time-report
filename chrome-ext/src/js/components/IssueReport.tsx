import * as React from 'react'

import { firebaseDb, dbCollections } from '../firebase'
import { IIssue,
         IParsedTimeNote,
         ITimeNote,
         IAggreReport } from '../types'
import { DateUtil } from '../utils'
import ReportTable from './ReportTable'
require('../../css/IssueReport.scss')

const TIME_REG = /time spent/
// baurine_bao @baurine added 1h 30m of time spent at 2018-06-02 about 15 hours ago
// 1. baurine, 2. 1h 30m, 3. 2018-06-02
const ADD_TIME_REG = /@(.+) added (.+) of time spent at (\d{4}-\d{2}-\d{2})/
// baurine_bao @baurine subtracted 1h of time spent at 2018-06-02 about 15 hours ago
// 1. baurine, 2. 1h, 3. 2018-06-02
const SUB_TIME_REG = /@(.+) subtracted (.+) of time spent at (\d{4}-\d{2}-\d{2})/
// baurine_bao @baurine removed time spent about 15 hours ago
// 1. baurine
const REMOVE_TIME_REG = /@(.+) removed time spent/

type Props = {
  issuePageInfo: IIssuePageInfo,
}

type State = {
  aggreReport: IAggreReport,
}

class IssueReport extends React.Component<Props, State> {
  private curIssue: IIssue
  private issueDoc: IIssue

  private issueDocRef: any
  private timeNotesCollectionRef: any
  private projectDocRef: any
  private userDocRef: any

  private mutationObserver: MutationObserver
  private parsedTimeNotes: IParsedTimeNote[]
  private removedTimeNoteId: number


  constructor(props: Props) {
    super(props)

    // state stores variables present UI
    this.state = {
      aggreReport: null
    }

    const { curDomainDocId, curIssue, curProject, curUser } = props.issuePageInfo
    // the variables has no business with UI should store in Component directly
    this.curIssue = Object.assign({}, curIssue)
    this.issueDoc = null
    this.parsedTimeNotes = []
    this.removedTimeNoteId = 0

    const domainDocRef =
      firebaseDb.collection(dbCollections.DOMAINS)
                .doc(curDomainDocId)
    this.issueDocRef = domainDocRef
                .collection(dbCollections.ISSUES)
                .doc(curIssue.doc_id)
    this.timeNotesCollectionRef = domainDocRef
                .collection(dbCollections.TIME_LOGS)
    this.projectDocRef = domainDocRef
                .collection(dbCollections.PROJECTS)
                .doc(curProject.id.toString())
    this.userDocRef = domainDocRef
                .collection(dbCollections.USERS)
                .doc(curUser.id.toString())
  }

  componentDidMount() {
    this.initData()
  }

  componentWillUnmount() {
    this.mutationObserver && this.mutationObserver.disconnect()
  }

  initData = () => {
    this.findIssue()
      .then((issueDoc: IIssue) => {
        this.issueDoc = Object.assign({}, issueDoc)
        this.curIssue.last_note_id = this.issueDoc.last_note_id
        this.parseNotesNode()
        this.observeNotesMutation()

        this.createOrUpdateProject()
        this.createOrUpdateUser()
      })
      .catch((err: any) => console.log(err))
  }

  findIssue = () => {
    return this.issueDocRef.get()
      .then((snapshot: any) => {
        if (snapshot.exists) {
          console.log('issue existed')
          return snapshot.data()
        } else {
          return this.createIssue()
        }
      })
  }

  createIssue = () => {
    return this.issueDocRef.set(this.curIssue)
      .then(() => {
        console.log('issue added')
        return this.curIssue
      })
  }

  updateIssue = () => {
    let issueDoc = this.issueDoc
    const curIssue = this.curIssue
    if (issueDoc.title !== curIssue.title ||
        issueDoc.description != curIssue.description ||
        issueDoc.web_url !== curIssue.web_url ||
        issueDoc.total_time_spent !== curIssue.total_time_spent ||
        issueDoc.last_note_id !== curIssue.last_note_id ||
        issueDoc.latest_spent_date !== curIssue.latest_spent_date) {
      issueDoc.title = curIssue.title
      issueDoc.description = curIssue.description
      issueDoc.web_url = curIssue.web_url
      issueDoc.total_time_spent = curIssue.total_time_spent
      issueDoc.last_note_id = curIssue.last_note_id
      issueDoc.latest_spent_date = curIssue.latest_spent_date
      this.issueDocRef
        .set(issueDoc)
        .then(() => console.log('issue updated'))
        .catch((err: any) => console.log(err))
    }
  }

  createOrUpdateProject = () => {
    const { curProject } = this.props.issuePageInfo
    this.projectDocRef
      .get()
      .then((snapshot: any) => {
        if (snapshot.exists) {
          console.log('projet existed')
          if (snapshot.data().name !== curProject.name) {
            return this.projectDocRef
              .update(curProject)
              .then(() => console.log('project updated'))
          }
        } else {
          return this.projectDocRef
            .set(curProject)
            .then(() => console.log('project added'))
        }
      })
      .catch((err: any) => console.log(err))
  }

  createOrUpdateUser = () => {
    const { curUser } = this.props.issuePageInfo
    this.userDocRef
      .get()
      .then((snapshot: any) => {
        if (snapshot.exists) {
          console.log('user existed')
          if (snapshot.data().name !== curUser.name) {
            return this.userDocRef
              .update(curUser)
              .then(() => console.log('user updated'))
          }
        } else {
          return this.userDocRef
            .set(curUser)
            .then(() => console.log('user added'))
        }
      })
      .catch((err: any) => console.log(err))
  }

  parseNotesNode = () => {
    this.parsedTimeNotes = []
    const notesList = document.getElementById('notes-list')
    notesList.childNodes.forEach(this.parseNoteNode)
    this.aggreAndSyncTimeNotes()
  }

  // return true means has change
  parseNoteNode = (node: Node) => {
    let idStr = (node as HTMLElement).id
    if (!idStr) return false

    const text = (node as HTMLElement).innerText
    // just choose the first text line, for avoiding same format content in the comment content
    // for example, someone added a comment: "@baurine added 1h of time spent at 2018-06-02"
    // it is not a real time note, but just a comment
    const firstLineText = text.split('\n')[0]
    if (!TIME_REG.test(firstLineText)) return false

    // id: note_284939
    const id = parseInt(idStr.split('_')[1])

    let regArr = ADD_TIME_REG.exec(firstLineText)
    if (regArr) {
      this.parsedTimeNotes.push({
        id,
        author: regArr[1],
        spent_date: regArr[3],
        spent_time: DateUtil.parseSpentTime(regArr[2]),
      })
      return true
    }
    regArr = SUB_TIME_REG.exec(firstLineText)
    if (regArr) {
      this.parsedTimeNotes.push({
        id,
        author: regArr[1],
        spent_date: regArr[3],
        spent_time: DateUtil.parseSpentTime(regArr[2]) * -1,
      })
      return true
    }
    regArr = REMOVE_TIME_REG.exec(firstLineText)
    if (regArr) {
      this.parsedTimeNotes.push({
        id,
        author: regArr[1],
        spent_date: '',
        spent_time: 0,
      })
      this.removedTimeNoteId = id
      return true
    }
    console.log('parse time note error', text)
    return false
  }

  aggreAndSyncTimeNotes = () => {
    this.aggregateIssueTime()
    this.syncTimeNotes()
    this.updateIssue()
  }

  aggregateIssueTime = () => {
    let aggreReport: any = {}
    let totalSpentTime = 0
    const timeNotes = this.parsedTimeNotes.filter(note => note.id > this.removedTimeNoteId)
    timeNotes.forEach(timeNote => {
      const user = timeNote.author
      const spentDate = timeNote.spent_date
      const spentTime = timeNote.spent_time

      totalSpentTime += spentTime

      aggreReport = aggreReport || {}
      aggreReport[user] = aggreReport[user] || {}
      aggreReport[user][spentDate] = aggreReport[user][spentDate] || 0
      aggreReport[user][spentDate] += spentTime

      // a virtual 'total' user
      aggreReport['total'] = aggreReport['total'] || {}
      aggreReport['total'][spentDate] = aggreReport['total'][spentDate] || 0
      aggreReport['total'][spentDate] += spentTime

      // a virtual 'total' date for every user
      aggreReport[user]['total'] = aggreReport[user]['total'] || 0
      aggreReport[user]['total'] += spentTime

      // a virtual 'total' date for issue's 'total' user
      aggreReport['total']['total'] = aggreReport['total']['total'] || 0
      aggreReport['total']['total'] += spentTime

      // aggregate users
      aggreReport['users'] = aggreReport['users'] || []
      if (!aggreReport['users'].includes(user)) {
        aggreReport['users'].push(user)
      }

      // aggregate dates
      aggreReport['dates'] = aggreReport['dates'] || []
      if (!aggreReport['dates'].includes(spentDate)) {
        aggreReport['dates'].push(spentDate)
      }
    })
    this.setState({aggreReport})

    this.curIssue.total_time_spent = totalSpentTime
    this.curIssue.latest_spent_date = timeNotes.map(note => note.spent_date).sort().reverse()[0] || ''
    console.log(this.curIssue.latest_spent_date)
  }

  syncTimeNotes = () => {
    // 2 steps
    // 1. delete old time logs before the first time note id
    if (this.curIssue.last_note_id < this.removedTimeNoteId) {
      const toDeleteNoteIds = this.parsedTimeNotes
        .filter(note => note.id < this.removedTimeNoteId)
        .map(note => note.id)
      toDeleteNoteIds.forEach(id => {
        this.timeNotesCollectionRef.doc(id.toString())
          .delete()
          .then(() => console.log('time note deleted'))
          .catch((err: any) => console.log(err))
      })
      this.curIssue.last_note_id = this.removedTimeNoteId
    }

    // 2. add new time logs after the last note id
    const toAddNotes = this.parsedTimeNotes.filter(note => note.id > this.curIssue.last_note_id)
    if (toAddNotes.length > 0) {
      toAddNotes.forEach(note => {
        const timeLog: ITimeNote = {
          ...note,
          issue_doc_id: this.curIssue.doc_id,
          project_id: this.curIssue.project_id
        }
        this.timeNotesCollectionRef
          .doc(note.id.toString())
          .set(timeLog)
          .then(() => console.log('new time note added'))
          .catch((err: any) => console.log(err))
        this.curIssue.last_note_id = note.id
      })
    }
  }

  observeNotesMutation = () => {
    const notesContainerNode = document.getElementById('notes-list')
    this.mutationObserver = new MutationObserver(this.parseMutations)
    const config = { childList: true }
    this.mutationObserver.observe(notesContainerNode, config)
  }

  // find out added note about spent time
  parseMutations = (mutations: MutationRecord[]) => {
    let hasChanges = false
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        const hasChange = this.parseNoteNode(node)
        hasChanges = hasChanges || hasChange
      })
    })
    hasChanges && this.aggreAndSyncTimeNotes()
  }

  render() {
    return (
      <div className='issue-report-container'>
        <p>working...</p>
        <ReportTable aggreReport={this.state.aggreReport}/>
      </div>
    )
  }
}

////////////////////////////////

import { IssuePageContext } from '../contexts'
import { IIssuePageInfo } from '../types'

const IssueReportWrapper = (props: {}) =>
  <IssuePageContext.Consumer>
    {
      (issuePageInfo: IIssuePageInfo) =>
      <IssueReport
        issuePageInfo={issuePageInfo}
        {...props}/>
    }
  </IssuePageContext.Consumer>

export default IssueReportWrapper
