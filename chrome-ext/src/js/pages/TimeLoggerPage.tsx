import * as React from 'react'

import AuthBox from '../components/AuthBox'
import TimeLoggerBox from '../components/TimeLoggerBox'
import { IssuePageContext } from '../contexts'

export default class TimeLoggerPage extends React.Component {
  render() {
    return (
      <IssuePageContext.Consumer>
        { (curPageInfo) => 
          <AuthBox curGitlabUser={curPageInfo.curGitlabUser}>
            <TimeLoggerBox/>
          </AuthBox>
        }
      </IssuePageContext.Consumer>
    )
  }
}
