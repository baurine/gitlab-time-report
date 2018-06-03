import { firebaseDb, dbCollections } from '../firebase'
import { IIssueRes, IIssue, IProject, IIssuePageInfo } from '../types'
import { CommonUtil, ApiUtil } from '../utils'

export default class IssuePageParser {
  private projectPath: string
  private issueType: string
  private issueNum: string

  private domainDocId: string

  parse = () => {
    return new Promise((resolve, reject) => {
      if (this.checkAvailabeIssuePage()) {
        this.checkDomainEnabled()
          .then((domainDocId: string) => this.domainDocId = domainDocId)
          .then(this.fetchIssueDetail)
          .then((pageInfo: IIssuePageInfo) => {
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
          const domainDocId = snapshot.data()[host]
          if (!domainDocId) {
            throw new Error('this domain is not enabled')
          }
          return domainDocId
        } else {
          throw new Error('there is no domains/enables doc in your database')
        }
      })
  }

  fetchIssueDetail = () => {
    const apiUrl = ['projects', encodeURIComponent(this.projectPath), this.issueType, this.issueNum].join('/')
    return ApiUtil.request(apiUrl)
             .then((issueRes: IIssueRes) => {
               const issue: IIssue = {
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
               const project: IProject = {
                 id: issueRes.project_id,
                 api_url: issueRes._links.project,
                 name: this.projectPath
               }
               const pageInfo = {
                 curDomainDocId: this.domainDocId,
                 curIssue: issue,
                 curProject: project
               }
               return pageInfo
             })
  }
}
