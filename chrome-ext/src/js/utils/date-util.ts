export default class DateUtil {
  static getDayFormat(date: Date) {
    // toISOString(): 2018-05-26T00:00:00.000Z
    // return: 2018-05-26
    return date.toISOString().substring(0, 10)
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
    if (spentTime < 0) {
      retStr = '-' + retStr
    }
    return retStr
  }
}
