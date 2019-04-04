import * as React from 'react'

require('../../css/common.scss')
import AuthBox from '../components/AuthBox'
import IssueReport from '../components/IssueReport'

const IssuePage = () =>
  <div className='issue-page gtr-container'>
    <AuthBox curPage='issue'>
      <IssueReport/>
    </AuthBox>
  </div>

export default IssuePage
