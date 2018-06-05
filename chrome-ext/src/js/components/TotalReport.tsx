import * as React from 'react'

import { firebaseDb, dbCollections } from '../firebase'
import { IReportBoxState, ITimeNote, IProject } from '../types'
import CommonUtil from '../utils/common-util'
import DateUtil from '../utils/date-util'
import FlashMessage from './FlashMessage'
require('../../css/TotalReport.scss')

const ALL = 'all'
const DEF_PROJECTS = {0: 'all'}

export default class TotalReport extends React.Component<{}, IReportBoxState> {
  private unsubscribe: () => void

  constructor(props: {}) {
    super(props)
    this.state = {
      enableDomains: {},
      projects: DEF_PROJECTS,
      users: [ALL],

      selectedDomain: '', // TODO
      selectedUser: ALL,
      selectedProjectId: 0,

      dateFrom: '',
      dateTo: '',

      aggreResult: {},
      message: 'loading...',
      showBtns: false,
    }
    this.unsubscribe = null
  }

  componentDidMount() {
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
    return firebaseDb.collection(dbCollections.DOMAINS)
      .doc('enables')
      .get()
      .then((snapshot: any) => {
        if (snapshot.exists) {
          const enableDomains = snapshot.data()
          const key = Object.keys(enableDomains)[0]
          const selectedDomain = enableDomains[key]
          this.setState({enableDomains, selectedDomain})
          return selectedDomain
        } else {
          throw new Error('has no enabled domain')
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
        let projects: any = DEF_PROJECTS
        querySnapshot.forEach((snapshot: any) => projects[snapshot.data().id] = snapshot.data().name)
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
        let users: string[] = []
        querySnapshot.forEach((snapshot: any)=>users.push(snapshot.data().username))
        users = [ALL].concat(users)
        this.setState({users})
      })
  }

  renderProjectSelector() {
    const { projects, selectedProjectId } = this.state
    const projectIds = Object.keys(projects)
    return (
      <select name='selectedProjectId'
              value={selectedProjectId}
              onChange={this.inputChange}>
        {
          projectIds.map(id =>
            <option value={id}
                    key={id}>
              {projects[id]}
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
    const { projects, aggreResult } = this.state
    const projectIds = Object.keys(aggreResult).sort((a, b) => projects[b] - projects[a])
    return projectIds.map(id => {
      const projectAggreResult = (aggreResult as any)[id]
      return this.renderProjectReportTable(projects[id], projectAggreResult)
    })
  }

  // TODO: extract to a component
  renderProjectReportTable(projectName: string, projectAggreResult: any) {
    const dates: string[] = projectAggreResult['dates'].sort().concat('total')
    const users: string[] = projectAggreResult['users'].sort().concat('total')
    return (
      <table key={projectName}>
        <thead>
          <tr>
            <th>{projectName}</th>
            {
              dates.map(date=><th key={date}>{date.substr(0, 10)}</th>)
            }
          </tr>
        </thead>
        <tbody>
          {
            users.map(user=>
              <tr key={user}>
                <td>{user}</td>
                {
                  dates.map(date=>
                    <td key={date}>{DateUtil.formatSpentTime(projectAggreResult[user][date])}</td>
                  )
                }
              </tr>
            )
          }
        </tbody>
      </table>
    )
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

  queryTimeLogs = () => {
    this.unsubscribe && this.unsubscribe()

    this.setState({message: 'applying...', aggreResult: {}, showBtns: false})

    const { selectedDomain, selectedProjectId, selectedUser, dateFrom, dateTo } = this.state

    let query = firebaseDb.collection(dbCollections.DOMAINS)
      .doc(selectedDomain)
      .collection(dbCollections.TIME_LOGS)

    if (dateFrom !== '') {
      query = query.where('spentDate', '>=', dateFrom)
    } else {
      query = query.limit(1000)
    }
    if (dateTo !== '') {
      query = query.where('spentDate', '<=', dateTo)
    } else {
      query = query.where('spentDate', '<=', DateUtil.getDayFormat(new Date()))
    }
    if (selectedProjectId !== 0) {
      query = query.where('project_id', '==', selectedProjectId)
    }
    if (selectedUser !== ALL) {
      query = query.where('author', '==', selectedUser)
    }
    query = query.orderBy('spentDate', 'desc')

    this.unsubscribe = query.onSnapshot((snapshot: any) => {
        let timeLogs: Array<ITimeNote> = []
        snapshot.forEach((s: any) => timeLogs.push(s.data()))
        this.aggregateTimeLogs(timeLogs)
      }, (err: any) => {
        this.setState({message: CommonUtil.formatFirebaseError(err), showBtns: true})
      })
  }

  aggregateTimeLogs(timeLogs: Array<ITimeNote>) {
    let aggreResult: any = {}
    timeLogs.forEach(timeLog => {
      const project = timeLog.project_id
      const user = timeLog.author
      const spentAt = timeLog.spentDate
      const spentTime = timeLog.spentTime

      aggreResult[project] = aggreResult[project] || {}
      aggreResult[project][user] = aggreResult[project][user] || {}
      aggreResult[project][user][spentAt] = aggreResult[project][user][spentAt] || 0
      aggreResult[project][user][spentAt] += spentTime

      // a virtual 'total' date for every user
      aggreResult[project][user]['total'] = aggreResult[project][user]['total'] || 0
      aggreResult[project][user]['total'] += spentTime

      // a virtual 'total' user for every project
      aggreResult[project]['total'] = aggreResult[project]['total'] || {}
      aggreResult[project]['total'][spentAt] = aggreResult[project]['total'][spentAt] || 0
      aggreResult[project]['total'][spentAt] += spentTime

      // a virtual 'total' date for every project's 'total' user
      aggreResult[project]['total']['total'] = aggreResult[project]['total']['total'] || 0
      aggreResult[project]['total']['total'] += spentTime

      // aggregate users
      aggreResult[project]['users'] = aggreResult[project]['users'] || []
      if (!aggreResult[project]['users'].includes(user)) {
        aggreResult[project]['users'].push(user)
      }

      // aggregate dates
      aggreResult[project]['dates'] = aggreResult[project]['dates'] || []
      if (!aggreResult[project]['dates'].includes(spentAt)) {
        aggreResult[project]['dates'].push(spentAt)
      }
    })
    this.setState({message: '', aggreResult, showBtns: true})
  }

  todo = () => {
    alert('TODO')
  }

  render() {
    return (
      <div className='report-box-container'>
        <div className='report-filters'>
          { this.renderProjectSelector() }
          { this.renderUserSelector() }
          <input type='date' name='dateFrom' onChange={this.inputChange}/>
          <input type='date' name='dateTo' onChange={this.inputChange}/>
          {
            this.state.showBtns &&
            <span>
              <button onClick={this.queryTimeLogs}>Apply</button>
              <button onClick={this.todo}>Today</button>
              <button onClick={this.todo}>This Week</button>
              <button onClick={this.todo}>Last Week</button>
              <button onClick={this.todo}>This Month</button>
            </span>
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
