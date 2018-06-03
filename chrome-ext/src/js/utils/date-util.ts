export default class DateUtil {
  static getDayFormat(date: Date) {
    // toISOString(): 2018-05-26T00:00:00.000Z
    // return: 2018-05-26
    return date.toISOString().substring(0, 10)
  }

  // timeStr: 1h 30m
  static parseSpentTime(timeStr: string) {
    const regArr = /((\d+)h)?\s*((\d+)m)?/.exec(timeStr)
    const hours = parseInt(regArr[2]) || 0
    const minutes = parseInt(regArr[4]) || 0
    const totalMins = hours*60 + minutes
    return totalMins
  }

  static formatSpentTime(spentTime: number) {
    let timeArr = []
    const hours = Math.floor(spentTime / 60)
    const remainMins = spentTime % 60
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
