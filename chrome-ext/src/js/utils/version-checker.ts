import { firebaseDb, dbCollections } from '../firebase'

const manifestConfig = require('../../../public/manifest')
const VERSION_CODE = manifestConfig.version_code
const VERSION_NAME = manifestConfig.version

export default class VersionChecker {
  checkVersion = () => {
    return firebaseDb.collection(dbCollections.SETTINGS)
      .doc('versions')
      .get()
      .then((snapshot: any) => {
        const data = snapshot.data()
        let enabled = data[VERSION_CODE]
        if (enabled !== false) {
          enabled = VERSION_CODE >= data.min
        }
        if (!enabled) {
          throw new Error(`Gitlab time report extension (${VERSION_NAME} | ${VERSION_CODE}) is outdated, please upgrade to a new version.`)
        }
      })
  }
}
