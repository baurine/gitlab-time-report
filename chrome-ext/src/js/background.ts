import { firebaseAuth } from "./firebase/config"
import SettingChecker from "./firebase/setting-checker"
import IssueTimeNote from "./firebase/issue-time-notes"
import {
  CHECK_DOMAIN_ACTION,
  CHECK_VERSION_ACTION,
  OPEN_DASHBOARD_PAGE_ACTION,
  QUERY_ISSUE_ACTION, IIssue,
  SYNC_TIME_NOTES_ACTION,
  UPDATE_ISSUE_ACTION
} from "./types"

///////////////
// ref: https://adamfeuer.com/notes/2013/01/26/chrome-extension-making-browser-action-icon-open-options-page/
const OPTIONS_PAGE = 'dashboard.html'

function openOrFocusOptionsPage() {
  const optionsUrl = chrome.extension.getURL(OPTIONS_PAGE)
  chrome.tabs.query({}, function (extensionTabs) {
    let found = false
    for (let i = 0; i < extensionTabs.length; i++) {
      if (optionsUrl === extensionTabs[i].url) {
        found = true
        chrome.tabs.update(extensionTabs[i].id, { "selected": true })
        break
      }
    }
    if (found === false) {
      chrome.tabs.create({ url: OPTIONS_PAGE })
    }
  })
}

chrome.browserAction.onClicked.addListener(openOrFocusOptionsPage)

///////////////
// https://www.chromium.org/Home/chromium-security/extension-content-script-fetches

chrome.runtime.onMessage.addListener(
  function (request, _sender, sendResponse) {
    console.log(request.action)
    if (request.action === CHECK_DOMAIN_ACTION) {
      SettingChecker.checkDomainEnabled(request.payload!.host)
        .then((domainId: string) => sendResponse({ body: domainId }))
        .catch((err: Error) => sendResponse({ err }))
    }

    if (request.action === CHECK_VERSION_ACTION) {
      SettingChecker.checkVersion()
        .then(() => sendResponse({ body: 'check version ok' }))
        .catch((err: Error) => sendResponse({ err }))
    }

    if (request.action === QUERY_ISSUE_ACTION) {
      IssueTimeNote.findIssue(request.payload)
        .then((issue: IIssue) => sendResponse({ body: issue }))
        .catch((err: Error) => sendResponse({ err }))
    }

    if (request.action === UPDATE_ISSUE_ACTION) {
      const { issuePageInfo, issueDoc } = request.payload
      IssueTimeNote.updateIssue(issuePageInfo, issueDoc)
      sendResponse({ body: 'update issue ok' })
    }

    if (request.action === SYNC_TIME_NOTES_ACTION) {
      const { curDomainId, toDeleteNoteIds, toAddNotes } = request.payload
      IssueTimeNote.syncTimeNotes(curDomainId, toDeleteNoteIds, toAddNotes)
      sendResponse({ body: 'sync time notes ok' })
    }
    return true
  }
)

///////////////

chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name === "auth_state")

  firebaseAuth.onAuthStateChanged((user: any) => {
    port.postMessage({ action: '', payload: user })
  })

  port.onMessage.addListener((msg) => {
    console.log(msg)
    if (msg.action === OPEN_DASHBOARD_PAGE_ACTION) {
      openOrFocusOptionsPage()
    }
  })
})
