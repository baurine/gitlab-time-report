import * as React from 'react'
import * as ReactDOM from 'react-dom'

import CommonUtil from './utils/common-util'
import IssuePageParser from './utils/issue-page-parser'
import IssuePage from './pages/IssuePage'

import { IssuePageContext } from './contexts'
import { IIssuePageInfo } from './types'

function main() {
  CommonUtil.log('load')

  const pageParser = new IssuePageParser()
  pageParser.parse()
    .then((curPageInfo: IIssuePageInfo) => {
      renderIssuePage(curPageInfo)
    })
    .catch(CommonUtil.handleError)
}

function renderIssuePage(curPageInfo: IIssuePageInfo) {
  const notesContainer = document.getElementById('notes')
  const issueReportContainer = document.createElement('div')
  issueReportContainer.id = 'issue-report-box'
  notesContainer.insertBefore(issueReportContainer, notesContainer.lastChild)
  ReactDOM.render(
    <IssuePageContext.Provider value={curPageInfo}>
      <IssuePage/>
    </IssuePageContext.Provider>,
    issueReportContainer
  )
}

main()
