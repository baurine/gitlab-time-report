
import * as React from 'react'

import { IAggreReport,
         IReportTableProps } from '../types'
import { DateUtil } from '../utils'

require('../../css/ReportTable.scss')

export default class ReportTable extends React.Component<IReportTableProps, {}> {

  onTitleClick = () => {
    const { onTitleClick } = this.props
    onTitleClick && onTitleClick()
  }

  renderCaption() {
    const { reportFor } = this.props
    if (reportFor && reportFor.type !== 'project') {
      return (
        <caption>
          <a href={reportFor.link} target='_blank'>{reportFor.name}</a>
        </caption>
      )
    }
    return null
  }

  renderTitle() {
    const { reportFor, onTitleClick } = this.props
    if (reportFor && reportFor.type === 'project') {
      if (onTitleClick) {
        return (
          <a href='#' onClick={this.onTitleClick}>{reportFor.name}</a>
        )
      } else {
        return reportFor.name
      }
    }
    return null
  }

  renderTable() {
    const { aggreReport, reportFor } = this.props
    if (!aggreReport || !aggreReport['users']) {
      return null
    }
    const dates: string[] = aggreReport['dates'].sort().concat('total')
    const users: string[] = aggreReport['users'].sort().concat('total')

    return (
      <div className='report-table-container'>
        <table>
          { this.renderCaption() }
          <thead>
            <tr>
              <th>
                { this.renderTitle()}
              </th>
              {
                users.map(user => <th key={user}>{user}</th>)
              }
            </tr>
          </thead>
          <tbody>
            {
              dates.map(date =>
                <tr key={date}>
                  <td className='fixed-width-font'>{DateUtil.appendWeekDay(date)}</td>
                  {
                    users.map(user =>
                      <td key={user}>{DateUtil.formatSpentTime((aggreReport as any)[user][date])}</td>
                    )
                  }
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    )
  }

  render() {
    return this.renderTable()
  }
}
