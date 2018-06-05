import * as React from 'react'

import AuthBox from '../components/AuthBox'
import TotalReport from '../components/TotalReport'

export default class DashboardPage extends React.Component {
  render() {
    return (
      <AuthBox>
        <TotalReport/>
      </AuthBox>
    )
  }
}
