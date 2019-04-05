import { CHECK_DOMAIN_ACTION,
         CHECK_VERSION_ACTION,
         QUERY_ISSUE_ACTION,
         IIssuePageInfo } from "./types"

function sendMessagePromise(msg: Message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (res) => {
      console.log(res)
      res.err ? reject(res.err) : resolve(res.body!)
    })
  })
}

////////////////////////////////

export function checkDomainMsg() {
  return sendMessagePromise({
    action: CHECK_DOMAIN_ACTION,
    payload: { host: document.location.host }
  })
}

export function checkVersionMsg() {
  return sendMessagePromise({
    action: CHECK_VERSION_ACTION
  })
}

////////////////////////////////

export function queryIssueMsg(issuePageInfo: IIssuePageInfo) {
  return sendMessagePromise({
    action: QUERY_ISSUE_ACTION,
    payload: issuePageInfo
  })
}
