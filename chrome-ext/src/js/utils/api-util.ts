const API_ROOT_PATH = '/api/v4/'

export default class ApiUtil {
  static request(path: string) {
    const fullPath = API_ROOT_PATH + path
    return fetch(fullPath, {credentials: 'include'})
      .then(res => res.json())
  }
}
