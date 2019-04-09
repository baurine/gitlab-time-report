export default class CommonUtil {
  static log(msg:string) {
    console.log("TimeLogger extension:", msg)
  }

  static handleError(err: any) {
    const errObj = {
      errCode: err.code,
      errMsg: err.message
    }
    CommonUtil.log(JSON.stringify(errObj))
  }

  static formatFirebaseError(err: any) {
    let message
    if (err.code === 'permission-denied') {
      message = 'You have no permission to access any data, please contact with your admin.'
    } else if (err.code === 'unavailable') {
      message = err.name + " Please make sure you can access firebase then refresh this page."
    } else {
      message = err.message || err.name || ''
    }
    return message
  }
}
