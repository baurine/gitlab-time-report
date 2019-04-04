import { CHECK_DOMAIN_ACTION, CHECK_VERSION_ACTION } from "../types"

export function checkDomain() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: CHECK_DOMAIN_ACTION,
        payload: { host: document.location.host }
      }, (res) => {
        console.log(res)
        if (res.err) {
          reject(res.err)
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
        reject(res.err)
      } else {
        resolve()
      }
    })
  })
}
