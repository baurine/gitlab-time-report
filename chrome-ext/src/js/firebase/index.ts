const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')

import firebaseConfig from './firebase-config'
// console.log('firebaseConfig:', firebaseConfig)
// firebase-config.ts
// export default {
//   apiKey: "***",
//   authDomain: "***",
//   databaseURL: "***m",
//   projectId: "***",
//   storageBucket: "***",
//   messagingSenderId: "***"
// }

firebase.initializeApp(firebaseConfig)

const firebaseAuth = firebase.auth()

const firebaseDb = firebase.firestore()
const settings = { timestampsInSnapshots: true }
firebaseDb.settings(settings)

const dbCollections = {
  SETTINGS: 'settings',
  DOMAINS: 'domains',
  PROJECTS: 'projects',
  USERS: 'users',
  ISSUES: 'issues',
  TIME_LOGS: 'timelogs',
}

export { firebaseAuth, firebaseDb, dbCollections }
