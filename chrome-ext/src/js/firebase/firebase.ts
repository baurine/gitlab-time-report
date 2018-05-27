const firebase = require('firebase/app')
require('firebase/firestore')
require('firebase/auth')

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

const firebaseDb = firebase.firestore()
const settings = { timestampsInSnapshots: true }
firebaseDb.settings(settings)

const firebaseAuth = firebase.auth()

export { firebaseDb, firebaseAuth }
