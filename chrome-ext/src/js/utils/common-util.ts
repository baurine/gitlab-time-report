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
      message = 'You have no permission to access any data, please contact your admin.'
    } else {
      // message = `errCode: ${err.code}, errMessage: ${err.message}`
      message = err.message
    }
    return message
  }
}
