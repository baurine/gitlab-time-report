import { firebaseDb, dbCollections } from '../firebase'

const VERSION_CODE = 3
const VERSION_NAME = '0.0.3'

export default class VersionChecker {
  checkVersion = () => {
    return firebaseDb.collection(dbCollections.SETTINGS)
      .doc('versions')
      .get()
      .then((snapshot: any) => {
        const data = snapshot.data()
        const enabled = VERSION_CODE >= data.min && data[VERSION_CODE]
        if (!enabled) {
          throw new Error(`Gitlab time report extension (${VERSION_NAME} | ${VERSION_CODE}) is outdated, please upgrade to a new version.`)
        }
      })
  }
}
