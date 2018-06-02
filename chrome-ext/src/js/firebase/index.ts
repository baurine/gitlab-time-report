const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')

const firebaseConfig = require('./firebase-config')
// console.log('firebaseConfig:', firebaseConfig)
// firebase-config.json
// {
//   "apiKey": "***",
//   "authDomain": "***",
//   "databaseURL": "***",
//   "projectId": "***",
//   "storageBucket": "***",
//   "messagingSenderId": "***"
// }

firebase.initializeApp(firebaseConfig)

const firebaseAuth = firebase.auth()

const firebaseDb = firebase.firestore()
const settings = { timestampsInSnapshots: true }
firebaseDb.settings(settings)

const dbCollections = {
  PROJECTS: 'projects',
  USERS: 'users',
  ISSUES: 'issues',
  TIME_LOGS: 'timelogs',
}

export { firebaseAuth, firebaseDb, dbCollections }
