import { firebaseDb, dbCollections } from '../firebase'
import { IIssueRes, IIssue, IProject, IProfile, IIssuePageInfo, IDomain } from '../types'
import { ApiUtil } from '../utils'

export default class IssuePageChecker {
  private projectPath: string
  private issueType: string
  private issueNum: string

  private curDomainDocId: string
  private curIssue: IIssue
  private curProject: IProject
  private curUser: IProfile

  checkAvailabeIssuePage = () => {
    // path = "/ekohe/podknife/issues/547"
    // reg = /^\/(\S+)\/(issues|merge_requests)\/(\d+)$/
    // arr = reg.exec(path)
    // ["/ekohe/podknife/merge_requests/547", "ekohe/podknife", "issues", "547" ...]
    const regPattern = /^\/(\S+)\/(issues|merge_requests)\/(\d+)$/
    const pathname = document.location.pathname

    const arr = regPattern.exec(pathname)
    if (arr === null) {
      console.log(`${document.location.href} is not a gitlab issue url`)
      return false
    }
    this.projectPath = arr[1]
    this.issueType = arr[2]
    this.issueNum = arr[3]

    const notesContainer = document.getElementById('notes')
    if (!notesContainer) {
      console.log('this page has no notes container')
      return false
    }

    return true
  }

  parse = () => {
    return this.checkDomainEnabled()
      .then(() => Promise.all([this.fetchIssueDetail(), this.fetchProfile()]))
      .then(() => {
        const pageInfo: IIssuePageInfo = {
          curDomainDocId: this.curDomainDocId,
          curIssue: this.curIssue,
          curProject: this.curProject,
          curUser: this.curUser
        }
        console.log(pageInfo)
        return pageInfo
      })
  }

  checkDomainEnabled = () => {
    // host and hostname
    // host includes port number while hostname doesn't if the location has port number
    // https://stackoverflow.com/a/11379802/2998877
    const host = document.location.host
    return firebaseDb.collection(dbCollections.SETTINGS)
      .doc('allowed_domains')
      .get()
      .then((snapshot: any) => {
        if (snapshot.exists) {
          const curDomainDoc: IDomain = snapshot.data()[host] as IDomain
          if (!curDomainDoc || !curDomainDoc.enabled) {
            throw new Error('this domain is not enabled')
          }
          this.curDomainDocId = curDomainDoc.doc_id
        } else {
          throw new Error('there is no settings/allowed_domains doc in your database')
        }
      })
  }

  fetchIssueDetail = () => {
    const apiUrl = ['projects', encodeURIComponent(this.projectPath), this.issueType, this.issueNum].join('/')
    return ApiUtil.request(apiUrl)
             .then((issueRes: IIssueRes) => {
               this.curIssue = {
                 id: issueRes.id,
                 iid: issueRes.iid,
                 project_id: issueRes.project_id,

                 title: issueRes.title,
                 description: issueRes.description,
                 web_url: issueRes.web_url,
                 total_time_spent: issueRes.time_stats.total_time_spent / 60,  // the time from api is measured by seconds

                 type: issueRes.sha ? 'merge_request' : 'issue',
                 last_note_id: 0,
                 latest_spent_date: '',
                 doc_id: [issueRes.project_id, issueRes.iid, issueRes.id].join('-')
               }
               this.curProject = {
                 id: issueRes.project_id,
                 name: this.projectPath
               }
             })
  }

  fetchProfile = () => {
    const apiUrl = 'user'
    return ApiUtil.request(apiUrl)
      .then((userRes: IProfile) => {
        this.curUser = {
          id: userRes.id,
          email: userRes.email,
          username: userRes.username,
          name: userRes.name,
        }
      })
  }
}
