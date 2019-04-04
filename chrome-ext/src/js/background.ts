import SettingChecker from "./firebase/setting-checker"
import { CHECK_DOMAIN_ACTION } from "./types"

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
  function (request, sender, sendResponse) {
    console.log(request.action)
    if (request.action === CHECK_DOMAIN_ACTION) {
      SettingChecker.checkDomainEnabled(request.payload!.host)
        .then((domainId: string) => sendResponse({ body: domainId }))
        .catch((err: Error) => sendResponse({ err: err.message }))
      return true
    }
  }
)
