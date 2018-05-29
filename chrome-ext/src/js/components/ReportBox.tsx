import * as React from 'react'

import { firebaseDb } from '../firebase/firebase'
import { IReportBoxState, ITimeLogDetail } from '../types'
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
      aggreResult: ''
    }
  }

  componentDidMount() {
    this.loadProjects()
    this.loadUsers()
  }

  loadProjects() {
    firebaseDb.collection('projects')
      .orderBy('name')
      .get()
      .then((querySnapshot: any)=>{
        let projects: string[] = []
        querySnapshot.forEach((snapshot: any)=>projects.push(snapshot.data().name))
        projects = ['all'].concat(projects)
        this.setState({projects})
      })
      .catch((err: Error)=>console.log(err.message))
  }

  loadUsers() {
    firebaseDb.collection('users')
      .orderBy('gitlabName')
      .get()
      .then((querySnapshot: any)=>{
        let users: string[] = []
        querySnapshot.forEach((snapshot: any)=>users.push(snapshot.data().gitlabName))
        users = ['all'].concat(users)
        this.setState({users})
      })
      .catch((err: Error)=>console.log(err.message))
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

  renderReport() {
    const { aggreResult } = this.state
    return <pre>{JSON.stringify(aggreResult)}</pre>
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
    const { selectedProject, selectedUser, dateFrom, dateTo } = this.state

    let query = firebaseDb.collection('time-logs')

    if (selectedProject !== 'all') {
      query = query.where('project', '==', selectedProject)
    }
    if (selectedUser !== 'all') {
      query = query.where('gitlabUser', '==', selectedUser)
    }
    if (dateFrom !== '') {
      query = query.where('spentAt', '>=', new Date(dateFrom))
    }
    if (dateTo !== '') {
      query = query.where('spentAt', '<', new Date(dateTo))
    }
    if (selectedProject === 'all') {
      query = query.orderBy('project')
    }
    if (selectedUser === 'all') {
      query = query.orderBy('gitlabUser')
    }
    query = query.orderBy('spentAt')
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
      .catch((err: Error)=>{
        this.setState({aggreResult: err.message})
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
    this.setState({aggreResult})
  }

  render() {
    return (
      <div className='report-box-container'>
        { this.renderProjectSelector() }
        { this.renderUserSelector() }
        <input type='date' name='dateFrom' onChange={this.inputChange}/>
        <input type='date' name='dateTo' onChange={this.inputChange}/>
        <button onClick={this.queryTimeLogs}>Report</button>
        { this.renderReport() }
      </div>
    )
  }
}
