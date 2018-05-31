export default class CommonUtil {
  static log(msg:string) {
    console.log("TimeLogger extension:", msg)
  }

  static handleError(err: any) {
    const errObj = {
      errCode: err.code,
      errMsg: err.message
    }
    this.log(JSON.stringify(errObj))
  }

  static formatFirebaseError(err: any) {
    return `errCode: ${err.Code}, errMessage: ${err.message}`
  }
}
