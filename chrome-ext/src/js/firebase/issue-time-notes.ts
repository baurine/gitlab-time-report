import { IIssuePageInfo, IIssue, ITimeNote } from "../types"
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

  static updateIssue = (issuePageInfo: IIssuePageInfo, issueDoc: IIssue) => {
    const { curDomainDocId, curIssue } = issuePageInfo

    const domainDocRef = firebaseDb
      .collection(dbCollections.DOMAINS)
      .doc(curDomainDocId)
    const issueDocRef = domainDocRef
      .collection(dbCollections.ISSUES)
      .doc(curIssue.doc_id)

    issueDocRef
      .set(issueDoc)
      .then(() => console.log('issue updated'))
      .catch((err: any) => console.log(err))
  }

  static syncTimeNotes = (curDomainDocId: string,
                          toDeleteNoteIds: number[],
                          toAddNotes: ITimeNote[]) => {
    const domainDocRef = firebaseDb
      .collection(dbCollections.DOMAINS)
      .doc(curDomainDocId)
    const timeNotesCollectionRef = domainDocRef
      .collection(dbCollections.TIME_LOGS)

    toDeleteNoteIds.forEach(id => {
      timeNotesCollectionRef.doc(id.toString())
        .delete()
        .then(() => console.log('time note deleted'))
        .catch((err: any) => console.log(err))
    })
    toAddNotes.forEach(note => {
      timeNotesCollectionRef
        .doc(note.id.toString())
        .set(note)
        .then(() => console.log('new time note added'))
        .catch((err: any) => console.log(err))
    })
  }

  static createOrUpdateProject = (issuePageInfo: IIssuePageInfo) => {
    const { curDomainDocId, curProject } = issuePageInfo
    const domainDocRef = firebaseDb
      .collection(dbCollections.DOMAINS)
      .doc(curDomainDocId)
    const projectDocRef = domainDocRef
      .collection(dbCollections.PROJECTS)
      .doc(curProject.id.toString())
    projectDocRef
      .get()
      .then((snapshot: any) => {
        if (snapshot.exists) {
          console.log('projet existed')
          if (snapshot.data().name !== curProject.name) {
            return projectDocRef
              .update(curProject)
              .then(() => console.log('project updated'))
          }
        } else {
          return projectDocRef
            .set(curProject)
            .then(() => console.log('project added'))
        }
      })
      .catch((err: any) => console.log(err))
  }

  static createOrUpdateUser = (issuePageInfo: IIssuePageInfo) => {
    const { curDomainDocId, curUser } = issuePageInfo
    const domainDocRef = firebaseDb
      .collection(dbCollections.DOMAINS)
      .doc(curDomainDocId)
    const userDocRef = domainDocRef
      .collection(dbCollections.USERS)
      .doc(curUser.id.toString())
    userDocRef
      .get()
      .then((snapshot: any) => {
        if (snapshot.exists) {
          console.log('user existed')
          if (snapshot.data().name !== curUser.name) {
            return userDocRef
              .update(curUser)
              .then(() => console.log('user updated'))
          }
        } else {
          return userDocRef
            .set(curUser)
            .then(() => console.log('user added'))
        }
      })
      .catch((err: any) => console.log(err))
  }
}
