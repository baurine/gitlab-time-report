import '../css/common.scss'

import React from 'react'
import ReactDOM from 'react-dom'
import dog4 from '../images/dog-4.jpeg' // less than 8kb, will convert to base64 string
import dog5 from '../images/dog-5.jpeg' // greater than 8kb, will keep image file

const test = () => {
  console.log('dashboard');
}

test()

class Test {
  log_test() {
    console.log('Test_test');
  }
}

new Test().log_test()

fetch('http://api.tvmaze.com/search/shows?q=batman')
.then(res => res.json())
.then(data => console.log(data))

class HelloComponent extends React.PureComponent {
  render() {
    return (
      <div>
        <h1>{this.props.name}</h1>
        <img src={dog4} />
        <img src={dog5} />
      </div>
    )
  }
}

ReactDOM.render(
  <HelloComponent name={'hello'}/>,
  document.getElementById('root')
)
