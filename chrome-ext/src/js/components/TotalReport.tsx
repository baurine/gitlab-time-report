import * as React from 'react'

import { firebaseDb, dbCollections } from '../firebase'
import { ITotalReportProps,
         ITotalReportState,
         ITimeNote,
         IProject,
         IIssue,
         IReportMeta, 
         IProfile} from '../types'
import CommonUtil from '../utils/common-util'
import DateUtil from '../utils/date-util'
import FlashMessage from './FlashMessage'
import ReportTable from './ReportTable'
require('../../css/TotalReport.scss')

const DEF_PROJECT: IProject = {id: 0, name: 'all'}
const DEF_USER: IProfile = {id: 0, username: 'all', email: 'all', name: 'all'}

export default class TotalReport extends React.Component<ITotalReportProps, ITotalReportState> {
  private unsubscribe: () => void

  constructor(props: ITotalReportProps) {
    super(props)
    this.state = {
      allowedDomains: {},
      projects: [DEF_PROJECT],
      users: [DEF_USER],
      issues: [],

      selectedDomainDocId: '', // TODO
      selectedProjectId: 0,
      selectedUserName: DEF_USER.username,

      dateFrom: '',
      dateTo: '',

      aggreProjectsReport: {},
      aggreIssuesReport: {},
      message: 'loading...',
      showBtns: false,

      detailProject: null
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
        let users: IProfile[] = [DEF_USER]
        querySnapshot.forEach((snapshot: any)=>users.push(snapshot.data()))
        this.setState({users})
        this.autoChooseUser(users)
      })
  }

  autoChooseUser = (users: IProfile[]) => {
    const { curUserEmail } = this.props
    const curUser = users.filter(user => user.email === curUserEmail)[0]
    if (curUser) {
      this.setState({selectedUserName: curUser.username})
    }
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

  showProjectReportDetail = (project: IProject) => {
    this.setState({detailProject: project})
  }

  gobackProjectsReports = () => {
    this.setState({detailProject: null})
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
    const { selectedDomainDocId, selectedProjectId, selectedUserName, dateFrom, dateTo } = this.state

    let query = firebaseDb.collection(dbCollections.DOMAINS)
      .doc(selectedDomainDocId)
      .collection(dbCollections.TIME_LOGS)

    if (dateFrom !== '') {
      query = query.where('spent_date', '>=', dateFrom)
    } else {
      query = query.limit(1000)
    }
    if (dateTo !== '') {
      query = query.where('spent_date', '<=', dateTo)
    } else {
      query = query.where('spent_date', '<=', DateUtil.getDateFormat(new Date()))
    }
    if (selectedProjectId !== 0) {
      query = query.where('project_id', '==', selectedProjectId)
    }
    if (selectedUserName !== DEF_USER.username) {
      query = query.where('author', '==', selectedUserName)
    }
    query = query.orderBy('spent_date', 'desc')

    this.unsubscribe = query.onSnapshot((snapshot: any) => {
        let timeLogs: ITimeNote[] = []
        snapshot.forEach((s: any) => timeLogs.push(s.data()))
        this.aggregateTimeLogs(timeLogs)
      }, (err: any) => {
        this.setState({message: CommonUtil.formatFirebaseError(err), showBtns: true})
      })
  }

  aggregateTimeLogs(timeLogs: ITimeNote[]) {
    let aggreProjectsReport: any = {}
    let aggreIssuesReport: any  ={}

    timeLogs.forEach(timeLog => {
      const project = timeLog.project_id
      const issue = timeLog.issue_doc_id

      const user = timeLog.author
      const spentAt = timeLog.spent_date
      const spentTime = timeLog.spent_time

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
      <div className="control has-icons-left">
        <div className='select'>
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
        </div>
        <div className="icon is-small is-left">
          <i className="fab fa-product-hunt"></i>
        </div>
      </div>
    )
  }

  renderUserSelector() {
    const { users, selectedUserName } = this.state
    return (
      <div className="control has-icons-left">
        <div className='select'>
          <select name='selectedUserName'
                  value={selectedUserName}
                  onChange={this.inputChange}>
            {
              users.map(user =>
                <option value={user.username}
                        key={user.username}>
                  {user.username}
                </option>
              )
            }
          </select>
        </div>
        <div className="icon is-small is-left">
          <i className="fas fa-user"></i>
        </div>
      </div>
    )
  }

  renderProjectsReports() {
    const { projects, aggreProjectsReport } = this.state
    return projects.map(project => {
      const projectAggreResult = (aggreProjectsReport as any)[project.id]
      const projectInfo: IReportMeta = {
        type: 'project',
        id: project.id,
        name: project.name,
        link: ''
      }
      return <ReportTable key={projectInfo.name}
                          aggreReport={projectAggreResult}
                          reportFor={projectInfo}
                          onTitleClick={() => this.showProjectReportDetail(project)}/>
    })
  }

  renderProjectDetailReports() {
    const { detailProject, issues, aggreProjectsReport, aggreIssuesReport } = this.state
    const projectInfo: IReportMeta = {
      type: 'project',
      id: detailProject.id,
      name: detailProject.name,
      link: ''
    }
    const projectAggreResult = (aggreProjectsReport as any)[detailProject.id]
    const projectIssues = issues.filter(issue => issue.project_id === detailProject.id)

    return (
      <div>
        <a onClick={this.gobackProjectsReports} href='#'>&lt; Go Back</a>
        <ReportTable aggreReport={projectAggreResult}
                     reportFor={projectInfo}/>
        <br/>
        {
          projectIssues.map(issue => {
            const issueAggreResult = (aggreIssuesReport as any)[issue.doc_id]
            const issueInfo: IReportMeta = {
              type: issue.type,
              id: issue.id,
              name: `${issue.type} #${issue.iid} - ${issue.title}`,
              link: issue.web_url
            }
            return <ReportTable key={issue.id}
                                aggreReport={issueAggreResult}
                                reportFor={issueInfo}/>
          })
        }
      </div>
    )
  }

  renderQueryFilters = () => {
    return (
      <div className='report-filters'>
        <div className='filters-container'>
          { this.renderProjectSelector() }
          { this.renderUserSelector() }
        </div>
        <div className='filters-container'>
          <div className='control has-icons-left'>
            <input className='input input-date'
                   type='date'
                   name='dateFrom'
                   value={this.state.dateFrom}
                   onChange={this.inputChange}/>
            <div className="icon is-small is-left">
              <i className="far fa-calendar-alt"></i>
            </div>
          </div>
          <div className='control has-icons-left'>
            <input className='input input-date'
                   type='date'
                   name='dateTo'
                   value={this.state.dateTo}
                   onChange={this.inputChange}/>
            <div className="icon is-small is-left">
              <i className="far fa-calendar-alt"></i>
            </div>
          </div>
          <a className='button is-light' onClick={this.chooseToday}>Today</a>
          <a className='button is-light' onClick={this.chooseThisWeek}>This Week</a>
          <a className='button is-light' onClick={this.chooseLastWeek}>Last Week</a>
          <a className='button is-light' onClick={this.chooseThisMonth}>This Month</a>
          <a className='button is-light' onClick={this.resetDate}>Reset</a>
        </div>
        <div>
        {
          this.state.showBtns &&
          <a className="button is-success"
             onClick={this.startQuery}>
            <span className="icon is-small">
              <i className="fas fa-check"></i>
            </span>
            <span>Apply</span>
          </a>
        }
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className='report-box-container'>
        { this.renderQueryFilters() }
        <FlashMessage message={this.state.message}/>
        <div className='report-result'>
          {
            this.state.detailProject ?
            this.renderProjectDetailReports() :
            this.renderProjectsReports()
          }
        </div>
      </div>
    )
  }
}
