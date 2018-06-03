import * as React from 'react'

import AuthBox from '../components/AuthBox'
import IssueReport from '../components/IssueReport'
import { IssuePageContext } from '../contexts'
import { IIssuePageInfo } from '../types'

export default class IssuePage extends React.Component {
  render() {
    return (
      <AuthBox>
        <IssueReport/>
      </AuthBox>
    )
  }
}
