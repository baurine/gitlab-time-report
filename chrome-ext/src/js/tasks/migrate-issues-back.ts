import { firebaseAuth, firebaseDb, dbCollections } from '../firebase'
import { CommonUtil } from '../utils'
import { IIssue, ITimeNote } from '../types'

const authInfo = require('./auth-info')
const EMAIL = authInfo.email
const PASSWORD = authInfo.password
const TARGET_DOMAIN_DOC_ID = authInfo.domain_id

let issues: IIssue[] = []

// delete the issues collection in firebase before running this task
// delete the issues_tmp collection in firebase after running this task if it works fine
function updateIssuesSchema() {
  firebaseAuth.signInWithEmailAndPassword(EMAIL, PASSWORD)
    .then(loadIssuesFromTmp)
    .then(updateIssuesBack)
    .catch(CommonUtil.handleError)
}

function loadIssuesFromTmp() {
  return firebaseDb.collection(dbCollections.DOMAINS)
    .doc(TARGET_DOMAIN_DOC_ID)
    .collection(dbCollections.ISSUES + '_tmp')
    .get()
    .then((snapshot: any) => {
      snapshot.forEach((item: any) => issues.push(item.data()))
    })
}

function updateIssuesBack() {
  // console.log(issues.length)
  // return
  issues.forEach(updateIssue)
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

updateIssuesSchema()
