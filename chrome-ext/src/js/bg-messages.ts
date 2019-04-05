import {
  CHECK_DOMAIN_ACTION,
  CHECK_VERSION_ACTION,
  QUERY_ISSUE_ACTION,
  IIssuePageInfo,
  ITimeNote,
  SYNC_TIME_NOTES_ACTION
} from "./types"

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

export function syncTimeNotesMsg(curDomainId: string,
                                 toDeleteNoteIds: number[],
                                 toAddNotes: ITimeNote[]) {
  return sendMessagePromise({
    action: SYNC_TIME_NOTES_ACTION,
    payload: {
      curDomainId,
      toDeleteNoteIds,
      toAddNotes
    }
  })
}
