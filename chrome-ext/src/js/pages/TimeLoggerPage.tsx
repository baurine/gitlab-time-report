import * as React from 'react'

import AuthBox from '../components/AuthBox'
import TimeLoggerBox from '../components/TimeLoggerBox'
import { IssuePageContext } from '../contexts'
import { IIssueInfo, IIssuePageInfo } from '../types'

export default class TimeLoggerPage extends React.Component {
  render() {
    return (
      <IssuePageContext.Consumer>
        { (curPageInfo: IIssuePageInfo) => 
          <AuthBox curGitlabUser={curPageInfo.curGitlabUser}>
            <TimeLoggerBox/>
          </AuthBox>
        }
      </IssuePageContext.Consumer>
    )
  }
}
