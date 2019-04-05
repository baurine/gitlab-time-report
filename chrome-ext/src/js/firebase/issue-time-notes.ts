import { IIssuePageInfo, IIssue } from "../types"
import { firebaseDb, dbCollections } from "./config"

export default class IssueTimeNote {
  static findIssue = (issuePageInfo: IIssuePageInfo) => {
    const { curDomainDocId, curIssue } = issuePageInfo

    const domainDocRef = firebaseDb
      .collection(dbCollections.DOMAINS)
      .doc(curDomainDocId)
    const issueDocRef = domainDocRef
      .collection(dbCollections.ISSUES)
      .doc(curIssue.doc_id)
    return issueDocRef.get().then((snapshot: any) => {
      if (snapshot.exists) {
        console.log("issue existed")
        return snapshot.data()
      } else {
        return IssueTimeNote.createIssue(issueDocRef, curIssue)
      }
    })
  }

  static createIssue = (issueDocRef: any, curIssue: IIssue) => {
    return issueDocRef.set(curIssue).then(() => {
      console.log("issue added")
      return curIssue
    })
  }
}
