import * as React from 'react'

import AuthBox from '../components/AuthBox'
import IssueReport from '../components/IssueReport'
require('../../css/common.scss')

export default class IssuePage extends React.Component {
  render() {
    return (
      <div className='gitlab-time-report-container'>
        <AuthBox>
          <IssueReport/>
        </AuthBox>
      </div>
    )
  }
}
