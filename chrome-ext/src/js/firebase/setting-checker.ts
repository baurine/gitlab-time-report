import { firebaseDb, dbCollections } from './config'
import { IDomain } from '../types'

const manifestConfig = require('../../../public/manifest')
const VERSION_CODE = manifestConfig.version_code
const VERSION_NAME = manifestConfig.version

export default class SettingChecker {
  static checkVersion = () => {
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
          throw new Error(`GitLab Time Report extension (${VERSION_NAME} | ${VERSION_CODE}) is outdated, please upgrade to a new version.`)
        }
      })
  }

  static checkDomainEnabled = () => {
    // host and hostname
    // host includes port number while hostname doesn't if the location has port number
    // https://stackoverflow.com/a/11379802/2998877
    const host = document.location.host
    return firebaseDb.collection(dbCollections.SETTINGS)
      .doc('allowed_domains')
      .get()
      .then((snapshot: any) => {
        if (snapshot.exists) {
          const curDomainDoc: IDomain = snapshot.data()[host] as IDomain
          if (!curDomainDoc || !curDomainDoc.enabled) {
            throw new Error('this domain is not enabled')
          }
          return curDomainDoc.doc_id
        } else {
          throw new Error('there is no settings/allowed_domains doc in your database')
        }
      })
  }
}
