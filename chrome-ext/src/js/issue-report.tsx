import * as React from 'react'
import * as ReactDOM from 'react-dom'

import CommonUtil from './utils/common-util'
import IssuePageParser from './utils/issue-page-parser'
import VersionChecker from './utils/version-checker'
import IssuePage from './pages/IssuePage'
import MessagePage from './pages/MessagePage'

import { IssuePageContext } from './contexts'
import { IIssuePageInfo } from './types'

function main() {
  CommonUtil.log('load')

  new IssuePageParser().parse()
    .then((curPageInfo: IIssuePageInfo) => checkVersion(curPageInfo))
    .catch(CommonUtil.handleError)
}

function checkVersion(curPageInfo: IIssuePageInfo) {
  const containerNode = createContainerNode()

  renderMessage('loading...', containerNode)

  new VersionChecker().checkVersion()
    .then(() => renderIssuePage(curPageInfo, containerNode))
    .catch((err: Error) => renderMessage(err.message, containerNode))
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
