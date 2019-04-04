import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { CommonUtil } from './utils'
import SettingChecker from './firebase/setting-checker'
import DashboardPage from './pages/DashboardPage'
import MessagePage from './pages/MessagePage'

function main() {
  renderMessagePage('loading...')

  SettingChecker.checkVersion()
    .then(renderDashboardPage)
    .catch((err: Error) => renderMessagePage(CommonUtil.formatFirebaseError(err)))
}

function renderDashboardPage() {
  ReactDOM.render(
    <DashboardPage/>,
    document.getElementById('root')
  )
}

function renderMessagePage(message: string) {
  ReactDOM.render(
    <MessagePage message={message}/>,
    document.getElementById('root')
  )
}

main()
