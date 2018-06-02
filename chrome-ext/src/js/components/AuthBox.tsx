import * as React from 'react'
const md5 = require('blueimp-md5')

import { firebaseAuth, firebaseDb, dbCollections } from '../firebase'
import { IAuthBoxProps, IAuthBoxState } from '../types'
import CommonUtil from '../utils/common-util'
import FlashMessage from './FlashMessage'
require('../../css/AuthBox.scss')

export default class AuthBox extends React.Component<IAuthBoxProps, IAuthBoxState> {
  constructor(props: IAuthBoxProps) {
    super(props)
    this.state = {
      user: null,
      email: '',
      password: '',

      loading: true,
      message: 'logging in...'
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
          .then(() => {
            CommonUtil.log('udpate user ok')
            this.setState({user})
          })
          .catch(CommonUtil.handleError)
      }
      // store curGitlabUser to users collection
      const userMD5 = md5(curGitlabUser)
      const userRef = firebaseDb.collection(dbCollections.USERS).doc(userMD5)
      userRef.get()
        .then((snapshot: any) => {
          if (snapshot.exists) {
            throw new Error('user existed')
          } else {
            return userRef.set({gitlabName: curGitlabUser})
          }
        })
        .then(() => CommonUtil.log('add user ok'))
        .catch(CommonUtil.handleError)
    }
  }

  signOut = () => {
    firebaseAuth.signOut()
  }

  logIn = () => {
    const { email, password } = this.state
    if (email.length === 0 || password.length === 0) {
      this.setState({message: 'Please fill the email and password.'})
      return
    }

    this.setState({loading: true, message: 'logging in...'})
    firebaseAuth.signInWithEmailAndPassword(email, password)
      .catch((err: Error) => this.setState({loading: false, message: CommonUtil.formatFirebaseError(err)}))
  }

  register = () => {
    const { email, password } = this.state
    if (email.length === 0 || password.length === 0) {
      this.setState({message: 'Please fill the email and password.'})
      return
    }

    this.setState({loading: true, message: 'registering...'})
    firebaseAuth.createUserWithEmailAndPassword(email, password)
      .catch((err: Error) => this.setState({loading: false, message: CommonUtil.formatFirebaseError(err)}))
  }

  resetPwd = () => {
    const { email } = this.state
    if (email.length === 0) {
      this.setState({message: 'Please fill the email.'})
      return
    }

    this.setState({loading: true, message: 'sending email...'})
    firebaseAuth.sendPasswordResetEmail(email)
      .then(() => this.setState({
        loading: false,
        message: 'Reset password email sent! Please go to your inbox to check the email.'
      }))
      .catch((err: Error) => this.setState({loading: false, message: CommonUtil.formatFirebaseError(err)}))
  }

  verifyEmail = () => {
    const { user } = this.state

    this.setState({loading: true, message: 'sending verification email...'})
    user.sendEmailVerification()
      .then(()=>this.setState({
        loading: false,
        message: 'Verification email sent! please go to your inbox to check the email.'
      }))
      .catch((err: Error) => this.setState({loading: false, message: CommonUtil.formatFirebaseError(err)}))
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
        <button className='btn btn-default' onClick={this.signOut}>Sign Out</button>
        <span className='login-status'>{user.displayName || user.email} has logged in.</span>
        { this.props.children }
      </div>
    )
  }

  renderSignedOutStatus() {
    const { email, password } = this.state
    return (
      <div className='login-form'>
        <div className='form-group'>
          <label>Email:</label>
          <input type='email'
                name='email'
                value={email}
                onChange={this.inputChange}/>
        </div>
        <div className='form-group'>
          <label>Password:</label>
          <input type='password'
                name='password'
                value={password}
                onChange={this.inputChange}/>
        </div>
        <div>
          <button className='btn btn-default' onClick={this.logIn}>Log In</button>
          <button className='btn btn-default' onClick={this.register}>Register</button>
          <button className='btn btn-default' onClick={this.resetPwd}>Reset Password</button>
        </div>
      </div>
    )
  }

  renderVerifyEmailStatus() {
    return (
      <div>
        <button className='btn btn-default' onClick={this.signOut}>Sign Out</button>
        <button className='btn btn-default' onClick={this.verifyEmail}>Verify Email</button>
        <span className='login-status'>Your email isn't verified yet, click the button to send verification email.</span>
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
        <FlashMessage message={message}/>
        { this.renderAuthInputs() }
      </div>
    )
  }
}
