import * as React from 'react'
import * as ReactDOM from 'react-dom'

import VersionChecker from './utils/version-checker'
import DashboardPage from './pages/DashboardPage'
import MessagePage from './pages/MessagePage'

function main() {
  ReactDOM.render(
    <MessagePage message='loading...'/>,
    document.getElementById('root')
  )

  new VersionChecker().checkVersion()
    .then(() => {
      ReactDOM.render(
        <DashboardPage/>,
        document.getElementById('root')
      )
    })
    .catch((err: Error) => {
      ReactDOM.render(
        <MessagePage message={err.message}/>,
        document.getElementById('root')
      )
    })
}

main()
