import { firebaseAuth, firebaseDb, dbCollections } from '../firebase'
import { CommonUtil } from '../utils'
import { IIssue, ITimeNote } from '../types'

const authInfo = require('./auth-info')
const EMAIL = authInfo.email
const PASSWORD = authInfo.password
const TARGET_DOMAIN_DOC_ID = authInfo.domain_id

let timeLogs: any = {}

function updateTimeLogsSchema() {
  firebaseAuth.signInWithEmailAndPassword(EMAIL, PASSWORD)
    .then(loadTimeLogs)
    .then(updateTimeLogs)
    .catch(CommonUtil.handleError)
}

function loadTimeLogs() {
  return firebaseDb.collection(dbCollections.DOMAINS)
    .doc(TARGET_DOMAIN_DOC_ID)
    .collection(dbCollections.TIME_LOGS)
    .get()
    .then((snapshot: any) => {
      snapshot.forEach((item: any) => timeLogs[item.id] = item.data())
    })
}

function updateTimeLogs() {
  // console.log(Object.keys(timeLogs).length)
  // return

  Object.keys(timeLogs).forEach(docId => {
    let timeLog: ITimeNote = timeLogs[docId] as ITimeNote
    if (timeLog.spent_time) {
      return
    }
    console.log(timeLog)

    const newTimeLog: ITimeNote = {
      id: timeLog.id,
      author: timeLog.author,
      // change spentTime to spent_time
      spent_time: timeLog.spentTime,
      // change spentDate to spent_date
      spent_date: timeLog.spentDate,

      // change issue_doc_id format
      issue_doc_id: timeLog.issue_doc_id.split('-').reverse().join('-'),
      project_id: timeLog.project_id
    }
    updateTimeLog(newTimeLog)
  })
}

function updateTimeLog(timeLog: ITimeNote) {
  firebaseDb.collection(dbCollections.DOMAINS)
    .doc(TARGET_DOMAIN_DOC_ID)
    .collection(dbCollections.TIME_LOGS)
    .doc(timeLog.id.toString())
    .set(timeLog)
    .then(() => console.log(`${timeLog.id} updated`))
    .catch(CommonUtil.handleError)
}

updateTimeLogsSchema()
