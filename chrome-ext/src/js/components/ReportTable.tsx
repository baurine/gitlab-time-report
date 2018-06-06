
import * as React from 'react'

import { IAggreReport,
         IReportTableProps } from '../types'
import { DateUtil } from '../utils'

require('../../css/ReportTable.scss')

export default class ReportTable extends React.Component<IReportTableProps, {}> {

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
          {
            reportFor && reportFor.type !== 'project' &&
            <caption>{reportFor.name}</caption>
          }
          <thead>
            <tr>
              <th>
                {
                  reportFor && reportFor.type === 'project' && reportFor.name
                }
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
                  <td>{DateUtil.appendWeekDay(date)}</td>
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
