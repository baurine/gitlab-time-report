import { firebaseAuth, firebaseDb, dbCollections } from '../firebase'
import { CommonUtil } from '../utils'
import { IIssue, ITimeNote } from '../types'

const authInfo = require('./auth-info')
const EMAIL = authInfo.email
const PASSWORD = authInfo.password
const TARGET_DOMAIN_DOC_ID = authInfo.domain_id

let issues: IIssue[] = []

function updateIssuesSchema() {
  firebaseAuth.signInWithEmailAndPassword(EMAIL, PASSWORD)
    .then(loadIssues)
    .then(updateIssues)
    .catch(CommonUtil.handleError)
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

function updateIssues() {
  // console.log(issues.length)
  // return

  issues.forEach(issue => {
    // change doc_id format from "id-iid-project_id" to "projet_id-iid-id"
    issue.doc_id = [issue.project_id, issue.iid, issue.id].join('-')
    updateIssue(issue)
  })
}

function updateIssue(issue: IIssue) {
  firebaseDb.collection(dbCollections.DOMAINS)
    .doc(TARGET_DOMAIN_DOC_ID)
    .collection(dbCollections.ISSUES + '_tmp')
    .doc(issue.doc_id)
    .set(issue)
    .then(() => console.log(`${issue.doc_id} updated`))
    .catch(CommonUtil.handleError)
}

updateIssuesSchema()
