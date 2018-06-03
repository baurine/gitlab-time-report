import { firebaseDb, dbCollections } from '../firebase'
import { IIssueRes, IIssue, IProject, IProfile, IIssuePageInfo } from '../types'
import { CommonUtil, ApiUtil } from '../utils'

export default class IssuePageParser {
  private projectPath: string
  private issueType: string
  private issueNum: string

  private curDomainDocId: string
  private curIssue: IIssue
  private curProject: IProject
  private curUser: IProfile

  parse = () => {
    return new Promise((resolve, reject) => {
      if (this.checkAvailabeIssuePage()) {
        Promise.all([this.checkDomainEnabled(), this.fetchIssueDetail(), this.fetchProfile()])
          .then(() => {
            const pageInfo: IIssuePageInfo = {
              curDomainDocId: this.curDomainDocId,
              curIssue: this.curIssue,
              curProject: this.curProject,
              curUser: this.curUser
            }
            console.log(pageInfo)
            resolve(pageInfo)
          })
          .catch((err: Error) => reject(err))
      } else {
        reject(new Error('invalid issue page'))
      }
    })
  }

  checkAvailabeIssuePage = () => {
    // path = "/ekohe/podknife/issues/547"
    // reg = /^\/(\S+)\/(issues|merge_requests)\/(\d+)$/
    // arr = reg.exec(path)
    // ["/ekohe/podknife/merge_requests/547", "ekohe/podknife", "issues", "547" ...]
    const regPattern = /^\/(\S+)\/(issues|merge_requests)\/(\d+)$/
    const pathname = document.location.pathname

    const arr = regPattern.exec(pathname)
    if (arr === null) {
      CommonUtil.log(`${document.location.href} is not a gitlab issue url`)
      return false
    }
    this.projectPath = arr[1]
    this.issueType = arr[2]
    this.issueNum = arr[3]

    const notesContainer = document.getElementById('notes')
    if (!notesContainer) {
      CommonUtil.log('this page has no notes container')
      return false
    }

    return true
  }

  checkDomainEnabled = () => {
    // host and hostname
    // host includes port number while hostname doesn't if the location has port number
    // https://stackoverflow.com/a/11379802/2998877
    const host = document.location.host
    return firebaseDb.collection(dbCollections.DOMAINS)
      .doc('enables')
      .get()
      .then((snapshot: any) => {
        if (snapshot.exists) {
          const curDomainDocId = snapshot.data()[host]
          if (!curDomainDocId) {
            throw new Error('this domain is not enabled')
          }
          this.curDomainDocId = curDomainDocId
        } else {
          throw new Error('there is no domains/enables doc in your database')
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
                 web_url: issueRes.web_url,
                 total_time_spent: issueRes.time_stats.total_time_spent,

                 type: issueRes.sha ? 'merge_request' : 'issue',
                 last_note_id: 0,
                 doc_id: [issueRes.id, issueRes.iid, issueRes.project_id].join('-')
               }
               this.curProject = {
                 id: issueRes.project_id,
                 api_url: issueRes._links.project,
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
          username: userRes.username
        }
      })
  }
}
