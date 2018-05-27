import * as React from 'react'
import * as ReactDOM from 'react-dom'

import TimeLoggerPage from './pages/TimeLoggerPage'
import CommonUtil from './utils/common-util'
import IssuePageParser from './utils/issue-page-parser'

import { IssuePageContext } from './contexts'

function main() {
  CommonUtil.log('load')

  const pageParser = new IssuePageParser()
  pageParser.parse()
    .then((curPageInfo: object) => {
      renderTimeLoggerPage(curPageInfo)
    })
    .catch((err: Error) => CommonUtil.log(err.message))
}

function renderTimeLoggerPage(curPageInfo: object) {
  const notesContainer = document.getElementById('notes')
  const timeLoggerContainer = document.createElement('div')
  timeLoggerContainer.id = 'time-logger-box'
  notesContainer.insertBefore(timeLoggerContainer, notesContainer.lastChild)
  ReactDOM.render(
    <IssuePageContext.Provider value={curPageInfo}>
      <TimeLoggerPage/>
    </IssuePageContext.Provider>,
    timeLoggerContainer
  )
}

main()
