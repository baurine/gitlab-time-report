import { CHECK_DOMAIN_ACTION,
         CHECK_VERSION_ACTION,
         QUERY_ISSUE_ACTION,
         IIssuePageInfo } from "../types"

export function checkDomain() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: CHECK_DOMAIN_ACTION,
        payload: { host: document.location.host }
      }, (res) => {
        console.log(res)
        if (res.err) {
          reject(new Error(res.err))
        } else {
          resolve(res.body!)
        }
      })
    })
}

export function checkVersion() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: CHECK_VERSION_ACTION
    }, (res) => {
      console.log(res)
      if (res.err) {
        reject(new Error(res.err))
      } else {
        resolve()
      }
    })
  })
}

////////////////////////////////

export function queryIssue(issuePageInfo: IIssuePageInfo) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: QUERY_ISSUE_ACTION,
      payload: issuePageInfo
    }, (res) => {
      console.log(res)
      if (res.err) {
        reject(new Error(res.err))
      } else {
        resolve(res.body!)
      }
    })
  })
}
