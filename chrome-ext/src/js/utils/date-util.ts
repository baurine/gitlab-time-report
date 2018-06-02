export default class DateUtil {
  static getDayFormat(date: Date) {
    // toISOString(): 2018-05-26T00:00:00.000Z
    // return: 2018-05-26
    return date.toISOString().substring(0, 10)
  }

  static formatSpentTime(spentTime: number) {
    let retStr = []
    const hours = Math.floor(spentTime / 60)
    const remainMins = spentTime % 60
    if (hours > 0) {
      retStr.push(`${hours}h`)
    }
    if (remainMins > 0) {
      retStr.push(`${remainMins}m`)
    }
    return retStr.join(' ')
  }
}
