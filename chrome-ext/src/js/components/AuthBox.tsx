import * as React from 'react'

const md5 = require('blueimp-md5')
import { firebaseDb, firebaseAuth } from '../firebase/firebase'
import { IAuthBoxProps, IAuthBoxState } from '../types'
require('../../css/AuthBox.scss')

export default class AuthBox extends React.Component<IAuthBoxProps, IAuthBoxState> {
  constructor(props: IAuthBoxProps) {
    super(props)
    this.state = {
      user: null,
      email: '',
      password: '',

      loading: true,
      message: 'loading...'
    }
  }

  componentDidMount() {
    this.loadAuthState()
  }

  loadAuthState() {
    firebaseAuth.onAuthStateChanged((user: any) => {
      this.setState({user, loading: false, message: ''})
      this.updateAndSaveUser(user, this.props.curGitlabUser)
    })
  }

  updateAndSaveUser(user: any, curGitlabUser: string) {
    if (user && user.emailVerified && curGitlabUser) {
      // update displayName as curGitlabUser
      if (user.displayName !== curGitlabUser) {
        user.updateProfile({displayName: curGitlabUser})
          .then(()=>console.log('update user ok'))
          .catch((err: Error)=>console.log(err.message))
      }
      // store curGitlabUser to users collection
      const userMD5 = md5(curGitlabUser)
      const userRef = firebaseDb.collection('users').doc(userMD5)
      userRef.get()
        .then((snapshot: any)=>{
          if (snapshot.exists) {
            throw new Error('user existed')
          } else {
            return userRef.set({gitlabName: curGitlabUser})
          }
        })
        .then(()=>console.log('add user ok'))
        .catch((err: Error)=>console.log(err.message))
    }
  }

  signOut = () => {
    firebaseAuth.signOut()
  }

  logIn = () => {
    const { email, password } = this.state
    if (email.length === 0 || password.length === 0) {
      this.setState({message: 'please fill the email and password.'})
      return
    }

    this.setState({loading: true, message: 'logging in...'})
    firebaseAuth.signInWithEmailAndPassword(email, password)
      .catch((err: Error)=>this.setState({loading: false, message: err.message}))
  }

  register = () => {
    const { email, password } = this.state
    if (email.length === 0 || password.length === 0) {
      this.setState({message: 'please fill the email and password.'})
      return
    }

    this.setState({loading: true, message: 'registering...'})
    firebaseAuth.createUserWithEmailAndPassword(email, password)
      .catch((err: Error)=>this.setState({loading: false, message: err.message}))
  }

  resetPwd = () => {
    const { email } = this.state
    if (email.length === 0) {
      this.setState({message: 'please fill the email.'})
      return
    }

    this.setState({loading: true, message: 'sending email...'})
    firebaseAuth.sendPasswordResetEmail(email)
      .then(()=>this.setState({
        loading: false,
        message: 'reset password email sent! please go to your inbox to check the email.'
      }))
      .catch((err: Error)=>this.setState({loading: false, message: err.message}))
  }

  verifyEmail = () => {
    const { user } = this.state

    this.setState({loading: true, message: 'sending verification email...'})
    user.sendEmailVerification()
      .then(()=>this.setState({
        loading: false,
        message: 'verification email sent! please go to your inbox to check the email.'
      }))
      .catch((err: Error)=>this.setState({loading: false, message: err.message}))
  }

  inputChange = (event: any) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value.trim()
    })
  }

  renderLoggedInStatus() {
    const { user } = this.state
    return (
      <div>
        <span>{user.displayName || user.email} has logged in.</span>
        <button onClick={this.signOut}>Sign Out</button>
        { this.props.children }
      </div>
    )
  }

  renderSignedOutStatus() {
    const { email, password } = this.state
    return (
      <div>
        Email:
        <input type='email'
               name='email'
               value={email}
               onChange={this.inputChange}/>
        Password:
        <input type='password'
               name='password'
               value={password}
               onChange={this.inputChange}/>
        <button onClick={this.logIn}>Log In</button>
        <button onClick={this.register}>Register</button>
        <button onClick={this.resetPwd}>Reset Password</button>
      </div>
    )
  }

  renderVerifyEmailStatus() {
    return (
      <div>
        <button onClick={this.signOut}>Sign Out</button>
        <button onClick={this.verifyEmail}>Verify Email</button>
        <span>Your email isn't verified yet, click the button to send verification email.</span>
      </div>
    )
  }

  renderAuthInputs() {
    const { loading, user } = this.state
    if (loading) {
      return null
    }
    if (!user) {
      return this.renderSignedOutStatus()
    }
    if (user.emailVerified) {
      return this.renderLoggedInStatus()
    }
    return this.renderVerifyEmailStatus()
  }

  render() {
    const { user, loading, message } = this.state
    return (
      <div className='auth-box-container'>
        <p className='msg'>{message}</p>
        { this.renderAuthInputs() }
      </div>
    )
  }
}
