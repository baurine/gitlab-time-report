import * as React from 'react'

require('../../css/common.scss')
import AuthBox from '../components/AuthBox'
import TotalReport from '../components/TotalReport'

const DashboardPage = () =>
  <div className='dashboard-page gtr-container'>
    <AuthBox>
      <TotalReport curUserEmail=''/>
    </AuthBox>
  </div>

export default DashboardPage
