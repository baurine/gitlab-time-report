import * as React from 'react'
import AuthBox from '../components/AuthBox'
import TimeLoggerBox from '../components/TimeLoggerBox'

export default class TimeLoggerPage extends React.Component {
  render() {
    return (
      <AuthBox>
        <TimeLoggerBox/>
      </AuthBox>
    )
  }
}
