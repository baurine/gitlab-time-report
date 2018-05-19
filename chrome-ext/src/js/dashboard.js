import '../css/common.scss'

import React from 'react'
import ReactDOM from 'react-dom'

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
    return <h1>{this.props.name}</h1>
  }
}

ReactDOM.render(
  <HelloComponent name={'hello'}/>,
  document.getElementById('root')
)
