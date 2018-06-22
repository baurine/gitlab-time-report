import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { CommonUtil, DateUtil } from './utils'
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
    let curPageInfo: IIssuePageInfo = null
    renderMessage('loading...', containerNode)

    issuePageChecker.parse()
      .then((pageInfo: IIssuePageInfo) => {
        curPageInfo = pageInfo
        renderTodaySpendTimeButton()
      })
      .then(checkVersion)
      .then(() => renderIssuePage(curPageInfo, containerNode))
      .catch((err: Error) => renderMessage(CommonUtil.formatFirebaseError(err), containerNode))
  }
}

function checkVersion() {
  return new VersionChecker().checkVersion()
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

function updateCommentContent() {
  const commentBox = document.querySelector('textarea#note-body') as HTMLTextAreaElement
  commentBox.value = `/spend  ${DateUtil.getTodayDate()}`
  commentBox.focus()
  commentBox.selectionEnd = 7
}

function renderTodaySpendTimeButton() {
  const editorBtnContainer = document.querySelector('li.md-header-toolbar')
  const firstBtn = editorBtnContainer.children[0]
  const spendTimeBtnContainer = document.createElement('span')
  editorBtnContainer.insertBefore(spendTimeBtnContainer, firstBtn)

  const spendTimeBtn =
    <button type='button' 
            tabIndex={-1}
            className='toolbar-btn js-md'
            onClick={updateCommentContent}>
      S
    </button>
  ReactDOM.render(spendTimeBtn, spendTimeBtnContainer)
}

function renderMessage(message: string, containerNode: Element) {
  ReactDOM.render(
    <MessagePage message={message}/>,
    containerNode
  )
}

main()
