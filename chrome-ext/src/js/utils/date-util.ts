export default class DateUtil {
  static getDayFormat(date: Date) {
    // the parameter date is local time

    // wrong
    // toISOString(): 2018-05-26T00:00:00.000Z
    // return: 2018-05-26

    // return date.toISOString().substring(0, 10)

    // dd = new Date()
    // Thu Jun 07 2018 12:52:48 GMT+0800 (CST)
    // dd = new Date(new Date().valueOf() - 6*60*60*1000)
    // Thu Jun 07 2018 06:54:13 GMT+0800 (CST)
    // dd.toISOString()
    // "2018-06-06T22:54:13.802Z"

    const fullYear = date.getFullYear()
    let month: number | string = date.getMonth() // start from 0
    month += 1
    if (month < 10) {
      month = `0${month}`
    }
    let day: number | string = date.getDate()
    if (day < 10) {
      day = `0${day}`
    }
    return `${fullYear}-${month}-${day}`
  }

  // date: '2018-06-05'
  // return '2018-06-05 (Tue)'
  static appendWeekDay(dateStr: string) {
    // Date.toDateString() -- "Tue Jun 05 2018"
    const date = new Date(dateStr)
    if (date.valueOf()) {
      const weekDay = date.toDateString().split(' ')[0]
      return `${dateStr} (${weekDay})`
    }
    return dateStr
  }

  // timeStr: 1h 30m
  static parseSpentTime(timeStr: string) {
    const regArr = /((\d+)d)?\s*((\d+)h)?\s*((\d+)m)?/.exec(timeStr)
    const days = parseInt(regArr[2]) || 0
    const hours = parseInt(regArr[4]) || 0
    const minutes = parseInt(regArr[6]) || 0
    const totalMins = days*8*60 + hours*60 + minutes
    return totalMins
  }

  static formatSpentTime(spentTime: number) {
    let timeArr = []
    let minus = spentTime < 0
    spentTime = Math.abs(spentTime)
    const days = Math.floor(spentTime / (60*8))
    let remainMins = spentTime % (60*8)
    const hours = Math.floor(remainMins / 60)
    remainMins = remainMins % 60
    if (days > 0) {
      timeArr.push(`${days}d`)
    }
    if (hours > 0) {
      timeArr.push(`${hours}h`)
    }
    if (remainMins > 0) {
      timeArr.push(`${remainMins}m`)
    }
    let retStr = timeArr.join(' ')
    if (minus) {
      retStr = '-' + retStr
    }
    return retStr
  }
}
