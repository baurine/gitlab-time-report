import * as React from 'react'
import { firebaseAuth } from '../firebase'

require('../../css/AuthBox.scss')
const logo = require('../../images/logo-64x64.png')

import { CommonUtil } from '../utils'
import FlashMessage from './FlashMessage'
import TotalReport from './TotalReport'

type State = {
  user: any,
  email: string,
  password: string,
  loading: boolean,
  message: string
}

const initialState: State = {
  user: null,
  email: '',
  password: '',
  loading: true,
  message: 'logging in...'
}

export default class AuthBox extends React.Component<{}, State> {
  readonly state = initialState

  componentDidMount() {
    this.loadAuthState()
  }

  loadAuthState() {
    firebaseAuth.onAuthStateChanged((user: any) => {
      this.setState({user, loading: false, message: ''})
    })
  }

  signOut = () => {
    firebaseAuth.signOut()
  }

  logIn = (e: any) => {
    e.preventDefault()

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

    const obj = {[name]: value.trim()}
    this.setState(obj as any)
  }

  // https://jaketrent.com/post/send-props-to-children-react/
  renderChildren = () => {
    const { user } = this.state
    return React.Children.map(this.props.children, child => {
      if ((child as any).type === TotalReport) {
        return React.cloneElement(child as any, {
          curUserEmail: user.email
        })
      }
      else {
        return child
      }
    })
  }

  renderHeader() {
    const { user } = this.state

    return (
      <div className='auth-header'>
        <div className="auth-header-left">
          <img src={logo} width={42} height={42}/>
          <span className='brand-name'>Gitlab Time Report</span>
        </div>
        {
          user && this.renderLoggedInStatus()
        }
      </div>
    )
  }

  renderLoggedInStatus() {
    const { user } = this.state
    return (
      <div className='auth-header-right'>
        <span className='login-status'>{user.email}</span>
        <button className='btn btn-default' onClick={this.signOut}>Sign Out</button>
      </div>
    )
  }

  renderSignedOutStatus() {
    const { email, password } = this.state
    return (
      <form className='login-form'
            onSubmit={this.logIn}>
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
      </form>
    )
  }

  renderVerifyEmailStatus() {
    return (
      <div className='verify-container'>
        <span className='login-status'>Your email isn't verified yet, click the button to send the verification email.</span>
        <button className='btn btn-default' onClick={this.verifyEmail}>Verify Email</button>
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
    if (!user.emailVerified) {
      return this.renderVerifyEmailStatus()
    }
    return this.renderChildren()
  }

  render() {
    const { message } = this.state
    return (
      <div className='auth-box-container'>
        { this.renderHeader() }
        <FlashMessage message={message}/>
        { this.renderAuthInputs() }
      </div>
    )
  }
}
