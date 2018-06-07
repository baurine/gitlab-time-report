import * as React from 'react'

import AuthBox from '../components/AuthBox'
import TotalReport from '../components/TotalReport'
require('../../css/common.scss')

export default class DashboardPage extends React.Component {
  render() {
    return (
      <div className='gitlab-time-report-container'>
        <AuthBox>
          <TotalReport/>
        </AuthBox>
      </div>
    )
  }
}
