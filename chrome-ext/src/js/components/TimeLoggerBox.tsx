import * as React from 'react'

const s = require('../../css/TimeLoggerBox.scss')

export default class TimeLoggerBox extends React.Component<any, any> {
  state = {
    inputText: '',
  }

  // textChange = (event: React.FormEvent<HTMLInputElement>) => {
  //   // https://coderwall.com/p/irfj6g/value-of-input-field-react-typescript
  //   this.setState({inputText: (event.target as HTMLInputElement).value})
  // }

  // https://charleslbryant.gitbooks.io/hello-react-and-typescript/content/Samples/AcceptUserInput.html
  textChange = (event: any) => {
    this.setState({inputText: event.target.value})
  }

  render() {
    return (
      <div className='time-logger-container'>
        <input type='text'
               value={this.state.inputText}
               placeholder='format: 1h30m'
               onChange={this.textChange}/>
        <input type='date'/>
        <button>Add</button>
      </div>
    )
  }
}
