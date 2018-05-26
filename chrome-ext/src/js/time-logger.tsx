import * as React from 'react'
import * as ReactDOM from 'react-dom'

import TimeLoggerBox from './components/TimeLoggerBox'
import CommonUtil from './utils/common-util'

function main() {
  CommonUtil.log('load')
  let pathname = document.location.pathname
  if (!/\/issues\/\d+/.test(pathname)) {
    CommonUtil.log('this is not a issue page')
    return
  }
  const notesContainer = document.getElementById('notes')
  if (!notesContainer) {
    CommonUtil.log('there is no notes container')
    return
  }
  const timeLoggerContainer = document.createElement('div')
  timeLoggerContainer.id = 'time-logger-box'
  notesContainer.insertBefore(timeLoggerContainer, notesContainer.lastChild)
  ReactDOM.render(
    <TimeLoggerBox/>,
    timeLoggerContainer
  )
}

main()
