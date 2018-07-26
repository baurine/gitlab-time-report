import * as React from 'react'

import AuthBox from '../components/AuthBox'
import TotalReport from '../components/TotalReport'
require('../../css/common.scss')

const DashboardPage = () =>
  <div className='dashboard-page gtr-container'>
    <AuthBox>
      <TotalReport curUserEmail=''/>
    </AuthBox>
  </div>

export default DashboardPage
