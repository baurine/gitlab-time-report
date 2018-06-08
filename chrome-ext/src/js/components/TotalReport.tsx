import * as React from 'react'

import { firebaseDb, dbCollections } from '../firebase'
import { IReportBoxState,
         ITimeNote,
         IProject,
         IIssue,
         IReportMeta } from '../types'
import CommonUtil from '../utils/common-util'
import DateUtil from '../utils/date-util'
import FlashMessage from './FlashMessage'
import ReportTable from './ReportTable'
require('../../css/TotalReport.scss')

const ALL = 'all'
const DEF_PROJECT: IProject = {id: 0, name: 'all'}

export default class TotalReport extends React.Component<{}, IReportBoxState> {
  private unsubscribe: () => void

  constructor(props: {}) {
    super(props)
    this.state = {
      allowedDomains: {},
      projects: [DEF_PROJECT],
      users: [ALL],
      issues: [],

      selectedDomainDocId: '', // TODO
      selectedUser: ALL,
      selectedProjectId: 0,

      dateFrom: '',
      dateTo: '',

      aggreProjectsReport: {},
      aggreIssuesReport: {},
      message: 'loading...',
      showBtns: false,
    }
    this.unsubscribe = null
  }

  componentDidMount() {
    this.chooseThisWeek()
    this.initData()
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe()
  }

  initData = () => {
    this.loadDomains()
      .then((domain: string) => Promise.all([this.loadProjects(domain), this.loadUsers(domain)]))
      .then(() => this.setState({message: '', showBtns: true}))
      .catch((err: any) => {
        this.setState({message: CommonUtil.formatFirebaseError(err)})
      })
  }

  loadDomains = () => {
    return firebaseDb.collection(dbCollections.SETTINGS)
      .doc('allowed_domains')
      .get()
      .then((snapshot: any) => {
        if (snapshot.exists) {
          // TODO: add a select
          const allowedDomains = snapshot.data()
          const enabledDomains = Object.keys(allowedDomains).filter(key => allowedDomains[key].enabled)
          if (enabledDomains.length === 0) {
            throw new Error('has no enabled domain')
          }
          const selectedDomainDocId = allowedDomains[enabledDomains[0]].doc_id
          this.setState({allowedDomains, selectedDomainDocId})
          return selectedDomainDocId
        } else {
          throw new Error('there is no settings/allowed_domains doc in your database')
        }
      })
  }

  loadProjects = (domain: string) => {
    return firebaseDb.collection(dbCollections.DOMAINS)
      .doc(domain)
      .collection(dbCollections.PROJECTS)
      .orderBy('name')
      .get()
      .then((querySnapshot: any) => {
        let projects: IProject[] = [DEF_PROJECT]
        querySnapshot.forEach((snapshot: any) => projects.push(snapshot.data()))
        this.setState({projects})
      })
  }

  loadUsers = (domain: string) => {
    return firebaseDb.collection(dbCollections.DOMAINS)
      .doc(domain)
      .collection(dbCollections.USERS)
      .orderBy('username')
      .get()
      .then((querySnapshot: any) => {
        let users: string[] = [ALL]
        querySnapshot.forEach((snapshot: any)=>users.push(snapshot.data().username))
        this.setState({users})
      })
  }

  inputChange = (event: any) => {
    const target  = event.target
    let value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    if (name === 'selectedProjectId') {
      value = parseInt(value)
    }

    this.setState({
      [name]: value
    })
  }

  chooseToday = () => {
    const todayDate = DateUtil.getTodayDate()
    this.setState({
      dateFrom: todayDate,
      dateTo: todayDate,
    })
  }

  chooseThisWeek = () => {
    const thisWeekRange = DateUtil.getThisWeekRange()
    this.setState({
      dateFrom: thisWeekRange[0],
      dateTo: thisWeekRange[1]
    })
  }

  chooseLastWeek = () => {
    const lastWeekRange = DateUtil.getLastWeekRange()
    this.setState({
      dateFrom: lastWeekRange[0],
      dateTo: lastWeekRange[1]
    })
  }

  chooseThisMonth = () => {
    const thisMonthRange = DateUtil.getThisMonthRange()
    this.setState({
      dateFrom: thisMonthRange[0],
      dateTo: thisMonthRange[1]
    })
  }

  resetDate = () => {
    this.setState({
      dateFrom: '',
      dateTo: ''
    })
  }

  startQuery = () => {
    this.unsubscribe && this.unsubscribe()
    this.setState({message: 'applying...', aggreProjectsReport: {}, aggreIssuesReport: {}, showBtns: false})

    this.queryIssues()
      .then(this.queryTimeLogs)
      .catch((err: any) => {
        this.setState({message: CommonUtil.formatFirebaseError(err), showBtns: true})
      })
  }

  queryIssues = () => {
    const { selectedDomainDocId, selectedProjectId, dateFrom, dateTo } = this.state

    let query = firebaseDb.collection(dbCollections.DOMAINS)
      .doc(selectedDomainDocId)
      .collection(dbCollections.ISSUES)

    if (dateFrom !== '') {
      query = query.where('latest_spent_date', '>=', dateFrom)
    } else {
      query = query.limit(1000)
    }
    if (dateTo !== '') {
      query = query.where('latest_spent_date', '<=', dateTo)
    } else {
      query = query.where('latest_spent_date', '<=', DateUtil.getDateFormat(new Date()))
    }
    if (selectedProjectId !== 0) {
      query = query.where('project_id', '==', selectedProjectId)
    }
    query = query.orderBy('latest_spent_date')

    return query.get()
      .then((snapshot: any) => {
        let issues: IIssue[] = []
        snapshot.forEach((item: any) => issues.push(item.data()))
        this.setState({issues})
      })
  }

  queryTimeLogs = () => {
    const { selectedDomainDocId, selectedProjectId, selectedUser, dateFrom, dateTo } = this.state

    let query = firebaseDb.collection(dbCollections.DOMAINS)
      .doc(selectedDomainDocId)
      .collection(dbCollections.TIME_LOGS)

    if (dateFrom !== '') {
      query = query.where('spentDate', '>=', dateFrom)
    } else {
      query = query.limit(1000)
    }
    if (dateTo !== '') {
      query = query.where('spentDate', '<=', dateTo)
    } else {
      query = query.where('spentDate', '<=', DateUtil.getDateFormat(new Date()))
    }
    if (selectedProjectId !== 0) {
      query = query.where('project_id', '==', selectedProjectId)
    }
    if (selectedUser !== ALL) {
      query = query.where('author', '==', selectedUser)
    }
    query = query.orderBy('spentDate', 'desc')

    this.unsubscribe = query.onSnapshot((snapshot: any) => {
        let timeLogs: ITimeNote[] = []
        snapshot.forEach((s: any) => timeLogs.push(s.data()))
        this.aggregateTimeLogs(timeLogs)
      }, (err: any) => {
        throw err
      })
  }

  aggregateTimeLogs(timeLogs: ITimeNote[]) {
    let aggreProjectsReport: any = {}
    let aggreIssuesReport: any  ={}

    timeLogs.forEach(timeLog => {
      const project = timeLog.project_id
      const issue = timeLog.issue_doc_id

      const user = timeLog.author
      const spentAt = timeLog.spentDate
      const spentTime = timeLog.spentTime

      this.aggregateTimeLog(aggreProjectsReport, project, user, spentAt, spentTime)
      this.aggregateTimeLog(aggreIssuesReport, issue, user, spentAt, spentTime)
    })
    this.setState({message: '', aggreProjectsReport, aggreIssuesReport, showBtns: true})
  }

  aggregateTimeLog = (aggreReport: any, rootKey: string | number, user: string, spentAt: string, spentTime: number) => {
    aggreReport[rootKey] = aggreReport[rootKey] || {}
    aggreReport[rootKey][user] = aggreReport[rootKey][user] || {}
    aggreReport[rootKey][user][spentAt] = aggreReport[rootKey][user][spentAt] || 0
    aggreReport[rootKey][user][spentAt] += spentTime

    // a virtual 'total' date for every user
    aggreReport[rootKey][user]['total'] = aggreReport[rootKey][user]['total'] || 0
    aggreReport[rootKey][user]['total'] += spentTime

    // a virtual 'total' user for every rootKey
    aggreReport[rootKey]['total'] = aggreReport[rootKey]['total'] || {}
    aggreReport[rootKey]['total'][spentAt] = aggreReport[rootKey]['total'][spentAt] || 0
    aggreReport[rootKey]['total'][spentAt] += spentTime

    // a virtual 'total' date for every rootKey's 'total' user
    aggreReport[rootKey]['total']['total'] = aggreReport[rootKey]['total']['total'] || 0
    aggreReport[rootKey]['total']['total'] += spentTime

    // aggregate users
    aggreReport[rootKey]['users'] = aggreReport[rootKey]['users'] || []
    if (!aggreReport[rootKey]['users'].includes(user)) {
      aggreReport[rootKey]['users'].push(user)
    }

    // aggregate dates
    aggreReport[rootKey]['dates'] = aggreReport[rootKey]['dates'] || []
    if (!aggreReport[rootKey]['dates'].includes(spentAt)) {
      aggreReport[rootKey]['dates'].push(spentAt)
    }
  }

  renderProjectSelector() {
    const { projects, selectedProjectId } = this.state
    return (
      <select name='selectedProjectId'
              value={selectedProjectId}
              onChange={this.inputChange}>
        {
          projects.map(project =>
            <option value={project.id}
                    key={project.id}>
              {project.name}
            </option>
          )
        }
      </select>
    )
  }

  renderUserSelector() {
    const { users, selectedUser } = this.state
    return (
      <select name='selectedUser'
              value={selectedUser}
              onChange={this.inputChange}>
        {
          users.map(user =>
            <option value={user}
                    key={user}>
              {user}
            </option>
          )
        }
      </select>
    )
  }

  renderReports() {
    const { projects, aggreProjectsReport } = this.state
    return projects.map(project => {
      const projectAggreResult = (aggreProjectsReport as any)[project.id]
      const projectInfo: IReportMeta = {
        type: 'project',
        id: project.id,
        name: project.name,
        link: ''
      }
      return <ReportTable aggreReport={projectAggreResult} reportFor={projectInfo} key={projectInfo.name}/>
    })
  }

  render() {
    return (
      <div className='report-box-container'>
        <div className='report-filters'>
          <div className='filters-container'>
            { this.renderProjectSelector() }
            { this.renderUserSelector() }
          </div>
          <div className='filters-container'>
            <input type='date'
                   name='dateFrom'
                   value={this.state.dateFrom}
                   onChange={this.inputChange}/>
            <input type='date'
                   name='dateTo'
                   value={this.state.dateTo}
                   onChange={this.inputChange}/>
            <button onClick={this.chooseToday}>Today</button>
            <button onClick={this.chooseThisWeek}>This Week</button>
            <button onClick={this.chooseLastWeek}>Last Week</button>
            <button onClick={this.chooseThisMonth}>This Month</button>
            <button onClick={this.resetDate}>Reset</button>
          </div>
          {
            this.state.showBtns &&
            <button onClick={this.startQuery} className='btn btn-default'>Apply</button>
          }
        </div>
        <div className='report-result'>
          { this.renderReports() }
          <FlashMessage message={this.state.message}/>
        </div>
      </div>
    )
  }
}
