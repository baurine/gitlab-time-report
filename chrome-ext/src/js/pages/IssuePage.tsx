import * as React from 'react'

import AuthBox from '../components/AuthBox'
import IssueReport from '../components/IssueReport'
require('../../css/common.scss')

const IssuePage = () =>
  <div className='issue-page gtr-container'>
    <AuthBox>
      <IssueReport/>
    </AuthBox>
  </div>

export default IssuePage
