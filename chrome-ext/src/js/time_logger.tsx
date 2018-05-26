import * as React from 'react'
import * as ReactDOM from 'react-dom'

import TimeLoggerBox from './components/TimeLoggerBox'

// utils
function log(msg: string) {
  console.log("TimeLogger extension:", msg)
}

function main() {
  log('load')
  let pathname = document.location.pathname
  if (!/\/issues\/\d+/.test(pathname)) {
    log("this is not a issue page")
    return
  }
  const notesContainer = document.getElementById('notes')
  if (!notesContainer) {
    log("there is no notes container")
    return
  }
  const timeLoggerContainer = document.createElement('div')
  timeLoggerContainer.id = 'time-logger-box'
  notesContainer.insertBefore(timeLoggerContainer, notesContainer.lastChild)
  renderTimeLogger(timeLoggerContainer)
}

function renderTimeLogger(container: HTMLElement) {
  ReactDOM.render(
    <TimeLoggerBox/>,
    container
  )
}

main()
