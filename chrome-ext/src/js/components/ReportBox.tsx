import * as React from 'react'

import { firebaseDb, dbCollections } from '../firebase/firebase'
import { IReportBoxState, ITimeLogDetail } from '../types'
import CommonUtil from '../utils/common-util'
import DateUtil from '../utils/date-util'
import FlashMessage from './FlashMessage'
require('../../css/ReportBox.scss')

export default class ReportBox extends React.Component<{}, IReportBoxState> {
  constructor(props: {}) {
    super(props)
    this.state = {
      users: ['all'],
      projects: ['all'],
      selectedUser: 'all',
      selectedProject: 'all',
      dateFrom: '',
      dateTo: '',

      aggreResult: {},

      message: ''
    }
  }

  componentDidMount() {
    this.initData()
  }

  initData = () => {
    this.loadProjects()
      .then(this.loadUsers)
      .catch((err: any) => {
        this.setState({message: CommonUtil.formatFirebaseError(err)})
      })
  }

  loadProjects = () => {
    return firebaseDb.collection(dbCollections.PROJECTS)
      .orderBy('name')
      .get()
      .then((querySnapshot: any) => {
        let projects: string[] = []
        querySnapshot.forEach((snapshot: any) => projects.push(snapshot.data().name))
        projects = ['all'].concat(projects)
        this.setState({projects})
      })
  }

  loadUsers = () => {
    return firebaseDb.collection(dbCollections.USERS)
      .orderBy('gitlabName')
      .get()
      .then((querySnapshot: any) => {
        let users: string[] = []
        querySnapshot.forEach((snapshot: any)=>users.push(snapshot.data().gitlabName))
        users = ['all'].concat(users)
        this.setState({users})
      })
  }

  renderProjectSelector() {
    const { projects, selectedProject } = this.state
    return (
      <select name='selectedProject'
              value={selectedProject}
              onChange={this.inputChange}>
        {
          projects.map(project =>
            <option value={project}
                    key={project}>
              {project}
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
    const { aggreResult } = this.state
    const projects = Object.keys(aggreResult).sort()
    return projects.map(project=>{
      const projectAggreResult = (aggreResult as any)[project]
      return this.renderProjectReportTable(project, projectAggreResult)
    })
  }

  // TODO: extract to a component
  renderProjectReportTable(projectName:string, projectAggreResult: any) {
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
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  queryTimeLogs = () => {
    this.setState({message: 'applying...', aggreResult: {}})

    const { selectedProject, selectedUser, dateFrom, dateTo } = this.state

    let query = firebaseDb.collection('timelogs')

    if (dateFrom !== '') {
      query = query.where('spentAt', '>=', new Date(dateFrom))
    } else {
      query = query.limit(1000)
    }
    if (dateTo !== '') {
      query = query.where('spentAt', '<=', new Date(dateTo))
    } else {
      query = query.where('spentAt', '<=', new Date())
    }
    if (selectedProject !== 'all') {
      query = query.where('project', '==', selectedProject)
    }
    if (selectedUser !== 'all') {
      query = query.where('gitlabUser', '==', selectedUser)
    }

    query = query.orderBy('spentAt', 'desc')
    query.get()
      .then((snapshot: any) => {
        let timeLogs: Array<ITimeLogDetail> = []
        snapshot.forEach((s: any)=>timeLogs.push({
          ...s.data(),
          spentAt: s.data().spentAt.toDate(),
          createdAt: s.data().createdAt.toDate()
        }))
        this.aggregateTimeLogs(timeLogs)
      })
      .catch((err: any)=>{
        this.setState({message: CommonUtil.formatFirebaseError(err)})
      })
  }

  aggregateTimeLogs(timeLogs: Array<ITimeLogDetail>) {
    let aggreResult: any = {}
    timeLogs.forEach(timeLog => {
      const project = timeLog.project
      const user = timeLog.gitlabUser
      const spentAt = timeLog.spentAt.toISOString()
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
    this.setState({message: '', aggreResult})
  }

  render() {
    return (
      <div className='report-box-container'>
        <div className='report-filters'>
          { this.renderProjectSelector() }
          { this.renderUserSelector() }
          <input type='date' name='dateFrom' onChange={this.inputChange}/>
          <input type='date' name='dateTo' onChange={this.inputChange}/>
          <button onClick={this.queryTimeLogs}>Apply</button>
        </div>
        <div className='report-result'>
          { this.renderReports() }
          <FlashMessage message={this.state.message}/>
        </div>
      </div>
    )
  }
}
