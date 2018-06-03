import * as React from 'react'

import { firebaseDb, dbCollections } from '../firebase'
import { IIssue,
         IOriginalTimeNote,
         IParsedTimeNote,
         IIssueReportProps,
         IIssueReportState } from '../types'
import { CommonUtil, DateUtil } from '../utils'
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

class IssueReport extends React.Component<IIssueReportProps, IIssueReportState> {
  private issueDocRef: any
  private mutationObserver: MutationObserver

  constructor(props: IIssueReportProps) {
    super(props)

    this.state = {
      issueDoc: null,
      timeNotes: [],
      aggreResult: null
    }

    const { issuePageInfo } = props
    this.issueDocRef =
      firebaseDb.collection(dbCollections.DOMAINS)
                .doc(issuePageInfo.curDomainDocId)
                .collection(dbCollections.ISSUES)
                .doc(issuePageInfo.curIssue.doc_id)
  }

  componentDidMount() {
    this.initData()
    // this.observeNotesMutation()
  }

  componentWillMount() {
    this.mutationObserver && this.mutationObserver.disconnect()
  }

  initData = () => {
    this.findIssue()
      .then((issueDoc: IIssue) => {
        this.setState({issueDoc}, () => {
          this.updateIssue()
          this.parseNotes()
        })
      })
      .catch(CommonUtil.handleError)
  }

  findIssue = () => {
    const { issuePageInfo } = this.props
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
    const { issuePageInfo } = this.props
    return this.issueDocRef.set(issuePageInfo.curIssue)
      .then(() => {
        console.log('issue added')
        return issuePageInfo.curIssue
      }) 
  }

  updateIssue = () => {
    const { issueDoc } = this.state
    const { curIssue } = this.props.issuePageInfo
    if (issueDoc.title !== curIssue.title ||
        issueDoc.web_url !== curIssue.web_url ||
        issueDoc.project_api_url !== curIssue.project_api_url ||
        issueDoc.total_time_spent !== curIssue.total_time_spent) {
      this.issueDocRef
        .update({
          title: curIssue.title,
          web_url: curIssue.web_url,
          project_api_url: curIssue.project_api_url,
          total_time_spent: curIssue.total_time_spent
        })
        .then(() => console.log('issue updated'))
        .catch(CommonUtil.handleError)
    }
  }

  parseNotes = () => {
    const notesList = document.getElementById('notes-list')

    let originalTimeNotes: IOriginalTimeNote[] = []
    notesList.childNodes.forEach(node => {
      const id = (node as HTMLElement).id
      if (id) {
        const text = (node as HTMLElement).innerText
        // just choose the first text line, for avoiding same format content in the comment content
        // for example, someone added a comment: "@baurine added 1h of time spent at 2018-06-02"
        // it is not a real time note, but just a comment
        const firstLineText = text.split('\n')[0]
        if (!TIME_REG.test(firstLineText)) return

        let regArr = ADD_TIME_REG.exec(firstLineText)
        if (regArr) {
          originalTimeNotes.push({
            id,
            author: regArr[1],
            spentTime: regArr[2],
            spentDate: regArr[3],
            action: '+'
          })
          return
        }
        regArr = SUB_TIME_REG.exec(firstLineText)
        if (regArr) {
          originalTimeNotes.push({
            id,
            author: regArr[1],
            spentTime: regArr[2],
            spentDate: regArr[3],
            action: '-'
          })
          return
        }
        regArr = REMOVE_TIME_REG.exec(firstLineText)
        if (regArr) {
          originalTimeNotes = []
          return
        }
        console.log('parse time note error', text)
      }
    })

    let parsedTimeNotes: IParsedTimeNote[] = originalTimeNotes.map( note => {
      // id: note_284939
      const id = parseInt(note.id.split('_')[1])
      let spentTime = DateUtil.parseSpentTime(note.spentTime)
      if (note.action === '-') {
        spentTime *= -1
      }
      return {
        id,
        author: note.author,
        spentTime,
        spentDate: note.spentDate
      }
    })
    this.setState({timeNotes: parsedTimeNotes})
    this.aggregateIssueTime(parsedTimeNotes)
  }

  aggregateIssueTime = (timeNotes: IParsedTimeNote[]) => {
    let aggreResult: any = {}
    timeNotes.forEach(timeNote => {
      const user = timeNote.author
      const spentDate = timeNote.spentDate
      const spentTime = timeNote.spentTime

      aggreResult = aggreResult || {}
      aggreResult[user] = aggreResult[user] || {}
      aggreResult[user][spentDate] = aggreResult[user][spentDate] || 0
      aggreResult[user][spentDate] += spentTime

      // a virtual 'total' user
      aggreResult['total'] = aggreResult['total'] || {}
      aggreResult['total'][spentDate] = aggreResult['total'][spentDate] || 0
      aggreResult['total'][spentDate] += spentTime

      // a virtual 'total' date for every user
      aggreResult[user]['total'] = aggreResult[user]['total'] || 0
      aggreResult[user]['total'] += spentTime

      // a virtual 'total' date for issue's 'total' user
      aggreResult['total']['total'] = aggreResult['total']['total'] || 0
      aggreResult['total']['total'] += spentTime

      // aggregate users
      aggreResult['users'] = aggreResult['users'] || []
      if (!aggreResult['users'].includes(user)) {
        aggreResult['users'].push(user)
      }

      // aggregate dates
      aggreResult['dates'] = aggreResult['dates'] || []
      if (!aggreResult['dates'].includes(spentDate)) {
        aggreResult['dates'].push(spentDate)
      }
    })
    this.setState({aggreResult})
  }

  observeNotesMutation() {
    const notesContainerNode = document.getElementById('notes-list')
    if (!notesContainerNode) {
      CommonUtil.log('notes-list does not exist')
      return
    }

    this.mutationObserver = new MutationObserver(this.parseMutations)

    const config = { childList: true }
    this.mutationObserver.observe(notesContainerNode, config)
  }

  // find out added note about spent time
  parseMutations = (mutations: MutationRecord[]) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        const nodeEl = node as HTMLElement
        if (nodeEl.id) {
          console.log(nodeEl.id, nodeEl.innerText)
        }
      })
    })
  }

  renderIssueTimeReport() {
    const { aggreResult } = this.state
    if (!aggreResult || !aggreResult['users']) {
      return null
    }
    const dates: string[] = aggreResult['dates'].sort().concat('total')
    const users: string[] = aggreResult['users'].sort().concat('total')
    return (
      <table>
        <thead>
          <tr>
            <th></th>
            {
              users.map(user => <th key={user}>{user}</th>)
            }
          </tr>
        </thead>
        <tbody>
          {
            dates.map(date =>
              <tr key={date}>
                <td>{date}</td>
                {
                  users.map(user =>
                    <td key={user}>{DateUtil.formatSpentTime(aggreResult[user][date])}</td>
                  )
                }
              </tr>
            )
          }
        </tbody>
      </table>
    )
  }

  render() {
    return (
      <div className='issue-report-container'>
        {
          this.renderIssueTimeReport()
        }
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
