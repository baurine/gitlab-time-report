import * as React from 'react'
import { firebaseAuth } from '../firebase/config'

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
          <span className='brand-name'>GitLab Time Report</span>
        </div>
        <div className='auth-header-right'>
          {
            user &&
            <React.Fragment>
              <span className='login-status'>{user.email}</span>
              <button className='btn btn-default' onClick={this.signOut}>Sign Out</button>
            </React.Fragment>
          }
          <a href="https://github.com/baurine/gitlab-time-report" className="github-link" target="_blank">
            { this.renderGithubLogo() }
          </a>
        </div>
      </div>
    )
  }

  renderGithubLogo = () =>
    <svg height="20"
         width="20"
         viewBox="0 0 16 16"
         version="1.1"
         aria-hidden="true">
      <path fillRule="evenodd"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z">
      </path>
    </svg>

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
