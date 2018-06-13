import * as React from 'react'
import * as ReactDOM from 'react-dom'

import CommonUtil from './utils/common-util'
import IssuePageChecker from './utils/issue-page-checker'
import VersionChecker from './utils/version-checker'
import IssuePage from './pages/IssuePage'
import MessagePage from './pages/MessagePage'

import { IssuePageContext } from './contexts'
import { IIssuePageInfo } from './types'

function main() {
  CommonUtil.log('load')

  const issuePageChecker = new IssuePageChecker()
  if (issuePageChecker.checkAvailabeIssuePage()) {
    const containerNode = createContainerNode()
    renderMessage('loading...', containerNode)

    issuePageChecker.parse()
      .then((curPageInfo: IIssuePageInfo) => checkVersion(curPageInfo, containerNode))
      .catch((err: Error) => renderMessage(CommonUtil.formatFirebaseError(err), containerNode))
  }
}

function checkVersion(curPageInfo: IIssuePageInfo, containerNode: Element) {
  new VersionChecker().checkVersion()
    .then(() => renderIssuePage(curPageInfo, containerNode))
}

function createContainerNode() {
  const notesContainer = document.getElementById('notes')
  const issueReportContainer = document.createElement('div')
  issueReportContainer.id = 'issue-report-box'
  notesContainer.parentNode.appendChild(issueReportContainer)
  return issueReportContainer
}

function renderIssuePage(curPageInfo: IIssuePageInfo, containerNode: Element) {
  ReactDOM.render(
    <IssuePageContext.Provider value={curPageInfo}>
      <IssuePage/>
    </IssuePageContext.Provider>,
    containerNode
  )
}

function renderMessage(message: string, containerNode: Element) {
  ReactDOM.render(
    <MessagePage message={message}/>,
    containerNode
  )
}

main()
