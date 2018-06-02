
export default class DateUtil {
  static getDayFormat(date: Date) {
    // toISOString(): 2018-05-26T00:00:00.000Z
    // return: 2018-05-26
    return date.toISOString().substring(0, 10)
  }
}
