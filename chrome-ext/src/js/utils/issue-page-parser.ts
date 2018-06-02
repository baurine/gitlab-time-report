import CommonUtil from '../utils/common-util'
import { IIssueInfo, IIssuePageInfo } from '../types'
import { resolve } from 'dns';

export default class IssuePageParser {
  parse() {
    return new Promise((resolve, reject) => {
      if (this.checkAvailabeIssuePage()) {
        const curGitlabUser = this.parseGitlabUser()
        CommonUtil.log('curGitlabUser: ' + curGitlabUser)

        const curIssue = this.parseIssue()
        CommonUtil.log('curIssue: ' + JSON.stringify(curIssue))

        const pageInfo: IIssuePageInfo = {curGitlabUser, curIssue}
        resolve(pageInfo)
      } else {
        reject(new Error('invalid issue page'))
      }
    })
  }

  checkAvailabeIssuePage() {
    const regPattern = /^\/(\S+)\/(issues|merge_requests)\/(\d+)$/
    const pathname = document.location.pathname
    if (!regPattern.test(pathname)) {
      CommonUtil.log(`${document.location.href} is not a gitlab issue url`)
      return false
    }
    const notesContainer = document.getElementById('notes')
    if (!notesContainer) {
      CommonUtil.log('this page has no notes container')
      return false
    }
    return true
  }

  parseGitlabUser() {
    const el = document.querySelector('a.profile-link')
    return el.getAttribute('data-user')
  }

  parseIssue() {
    // type, project, num, createdBy, issueCreatedAt, title

    // path = "/ekohe/podknife/issues/547"
    // reg = /^\/(\S+)\/(issues|merge_requests)\/(\d+)$/
    // arr = reg.exec(path)
    // ["/ekohe/podknife/merge_requests/547", "ekohe/podknife", "issues", "547" ...]
    const regPattern = /^\/(\S+)\/(issues|merge_requests)\/(\d+)$/
    const pathname = document.location.pathname
    const arr = regPattern.exec(pathname)
    if (arr === null) {
      return
    }
    const project = arr[1]
    let type = arr[2]
    if (type === 'issues') {
      type = 'issue'
    } else {
      type = 'merge_request'
    }
    const num = parseInt(arr[3])

    const createdBy = this.parseIssueAuthor()
    const issueCreatedAt = this.parseCreatedAt()
    const title = this.parseTitle(type)

    const issueInfo: IIssueInfo = {
      type,
      project,
      num,
      createdBy,
      issueCreatedAt,
      title
    }
    return issueInfo 
  }

  parseIssueAuthor() {
    const authorEl = document.querySelector('a.author_link.hidden-xs')
    // authorEl.href: http://..../baurine
    // author.getAttribute('href'): /baurine
    const authorLink = authorEl.getAttribute('href')
    return authorLink.replace('/', '')
  }

  parseCreatedAt() {
    const timeEl = document.querySelector('time.js-timeago')
    const datetime = timeEl.getAttribute('datetime')
    return new Date(datetime)
  }

  parseTitle(type: string) {
    let titleEl: HTMLElement
    if (type === 'issue') {
      titleEl = document.querySelector('div.title-container h2.title')
    } else {
      titleEl = document.querySelector('div.merge-request-details h2.title')
    }
    return titleEl.innerText
  }
}
