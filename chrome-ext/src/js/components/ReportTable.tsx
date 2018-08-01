
import * as React from 'react'

require('../../css/ReportTable.scss')
import { IAggreReport, IReportMeta } from '../types'
import { DateUtil } from '../utils'

type Props = {
  aggreReport: IAggreReport | null,
  reportFor?: IReportMeta,
  onTitleClick?: () => void
}

export default class ReportTable extends React.Component<Props, {}> {
  onTitleClick = () => {
    const { onTitleClick } = this.props
    onTitleClick && onTitleClick()
  }

  renderCaption = () => {
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

  renderTitle = () => {
    const { reportFor, onTitleClick } = this.props
    if (reportFor && reportFor.type === 'project') {
      if (onTitleClick && reportFor.name !== 'all') {
        return (
          <a onClick={this.onTitleClick}>{reportFor.name}</a>
        )
      } else {
        return reportFor.name
      }
    }
    return null
  }

  renderTable = () => {
    const { aggreReport } = this.props
    if (!aggreReport || !aggreReport['users']) {
      return null
    }

    const dates: string[] = aggreReport['dates'].sort()
    const users: string[] = aggreReport['users'].sort()
    return (
      <div className='report-table-container table is-bordered is-striped is-hoverable is-fullwidth'>
        <table>
          { this.renderCaption() }
          <thead>
            <tr>
              <th>{this.renderTitle()}</th>
              { users.map(user => <th key={user}>{user}</th>) }
              <th>total</th>
            </tr>
          </thead>
          <tbody>
            {
              dates.map(date =>
                <tr key={date}>
                  <th className='fixed-width-font'>{DateUtil.appendWeekDay(date)}</th>
                  {
                    users.map(user =>
                      <td key={user}>{DateUtil.formatSpentTime((aggreReport as any)[user][date])}</td>
                    )
                  }
                  <th key='total'>{DateUtil.formatSpentTime((aggreReport as any)['total'][date])}</th>
                </tr>
              )
            }
          </tbody>
          <tfoot>
            <tr key='total'>
              <th>total</th>
              {
                users.map(user =>
                  <th key={user}>{DateUtil.formatSpentTime((aggreReport as any)[user]['total'])}</th>
                )
              }
              <th key='total'>{DateUtil.formatSpentTime((aggreReport as any)['total']['total'])}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  render() {
    return this.renderTable()
  }
}
