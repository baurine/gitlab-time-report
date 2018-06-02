import * as React from 'react'

import AuthBox from '../components/AuthBox'
import ReportBox from '../components/ReportBox'

export default class ReportPage extends React.Component {
  render() {
    return (
      <AuthBox>
        <ReportBox/>
      </AuthBox>
    )
  }
}
