const firebase = require('firebase/app')
require('firebase/database')

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
const firebaseDb = firebase.database()

export { firebase, firebaseDb }
