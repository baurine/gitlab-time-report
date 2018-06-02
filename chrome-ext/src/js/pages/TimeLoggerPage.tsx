import * as React from 'react'

import AuthBox from '../components/AuthBox'
import IssueReport from '../components/IssueReport'
import { IssuePageContext } from '../contexts'
import { IIssuePageInfo } from '../types'

export default class TimeLoggerPage extends React.Component {
  render() {
    return (
      <IssuePageContext.Consumer>
        { (issuePageInfo: IIssuePageInfo) => 
          <AuthBox>
            <IssueReport/>
          </AuthBox>
        }
      </IssuePageContext.Consumer>
    )
  }
}
