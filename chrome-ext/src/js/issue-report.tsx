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
    renderTodaySpendTimeButton()

    const containerNode = createContainerNode()
    let curPageInfo: IIssuePageInfo
    renderMessage('loading...', containerNode)

    issuePageChecker.parse()
      .then((pageInfo: IIssuePageInfo) => {
        curPageInfo = pageInfo
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
  const issueReportContainer = document.createElement('div')
  issueReportContainer.id = 'issue-report-box'

  const notesContainer = document.getElementById('notes')
  if (notesContainer) {
    notesContainer.parentNode && notesContainer.parentNode.appendChild(issueReportContainer)
  }
  return issueReportContainer
}

function renderIssuePage(curPageInfo: IIssuePageInfo, containerNode: Element) {
  ReactDOM.render(
    <IssuePageContext.Provider value={curPageInfo as any}>
      <IssuePage/>
    </IssuePageContext.Provider>,
    containerNode
  )
}

function updateCommentContent() {
  const commentBox = document.querySelector('.js-main-target-form textarea.note-textarea') as HTMLTextAreaElement
  commentBox.value = `/spend  ${DateUtil.getTodayDate()}`
  commentBox.focus()
  commentBox.selectionEnd = 7
}

function renderTodaySpendTimeButton() {
  // it has many comment forms in merge request page,
  // but only the form in the most bottom of the page has `.js-main-target-form` class
  const editorBtnContainer = document.querySelector('.js-main-target-form li.md-header-toolbar')
  if (editorBtnContainer) {
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
}

function renderMessage(message: string, containerNode: Element) {
  ReactDOM.render(
    <MessagePage message={message}/>,
    containerNode
  )
}

main()
