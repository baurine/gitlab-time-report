const firebase = require('firebase/app')
require('firebase/firestore')

const firebaseConfig = require('./firebase_config')
// console.log('firebaseConfig:', firebaseConfig)
// firebase_config.json
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

export { firebase, firebaseDb }
