import '../css/common.scss'

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

const async_test = async () => {
  return 'async_test'
}

async_test().then(ret => console.log(ret))
