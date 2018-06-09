import { firebaseAuth, firebaseDb, dbCollections } from '../firebase'
import { CommonUtil } from '../utils'
import { IIssue, ITimeNote } from '../types'

const authInfo = require('./auth-info')
const EMAIL = authInfo.email
const PASSWORD = authInfo.password
const TARGET_DOMAIN_DOC_ID = authInfo.domain_id

let issues: IIssue[] = []
let timeLogs: any = {}

function updateIssueLastSpentDate() {
  firebaseAuth.signInWithEmailAndPassword(EMAIL, PASSWORD)
    .then(loadIssuesAndTimeLogs)
    .then(updateIssues)
    .catch(CommonUtil.handleError)
}

function loadIssuesAndTimeLogs() {
  return Promise.all([loadIssues(), loadTimeLogs()])
}

function loadIssues() {
  return firebaseDb.collection(dbCollections.DOMAINS)
    .doc(TARGET_DOMAIN_DOC_ID)
    .collection(dbCollections.ISSUES)
    .get()
    .then((snapshot: any) => {
      snapshot.forEach((item: any) => issues.push(item.data()))
    })
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

function updateIssues() {
  // console.log(issues.length)
  // console.log(Object.keys(timeLogs).length)
  // return

  issues.forEach(issue => {
    console.log(issue)
    if (issue.last_note_id !== 0 && !issue.latest_spent_date) {
      const timeLog: ITimeNote = timeLogs[issue.last_note_id] as ITimeNote
      console.log(timeLog)

      if (timeLog) {
        issue.latest_spent_date = timeLog.spentDate
        updateIssue(issue)
      }
    }
  })
}

function updateIssue(issue: IIssue) {
  firebaseDb.collection(dbCollections.DOMAINS)
    .doc(TARGET_DOMAIN_DOC_ID)
    .collection(dbCollections.ISSUES)
    .doc(issue.doc_id)
    .set(issue)
    .then(() => console.log(`${issue.doc_id} updated`))
    .catch(CommonUtil.handleError)
}

updateIssueLastSpentDate()
