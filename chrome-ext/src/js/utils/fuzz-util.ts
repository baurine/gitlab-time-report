export default class FuzzUtil {
  static fuzzEmail(email: string): string {
    let strs = email.split('@')
    if (strs[1]) {
      let suffies = strs[1].split('.')
      suffies[0] = '*'.repeat(suffies[0].length)
      strs[1] = suffies.join('.')
    }
    return strs.join('@')
  }

  static fuzzProjectName(projectName: string): string {
    if (projectName === 'all') return projectName

    let strs = projectName.split('/')
    strs = strs.map(str => '*'.repeat(str.length))
    return strs.join('/')
  }

  // issueName format: issue #xx - detail
  static fuzzIssueName(issueName: string): string {
    const index = issueName.indexOf('-')
    const prefix = issueName.substr(0, index-1)
    const suffix = issueName.substr(index+1)
    return prefix + ' - ' + '*'.repeat(suffix.length)
  }

  static fuzzUserName(userName: string): string {
    if (userName === 'all' || userName === 'baurine') return userName

    return '*'.repeat(userName.length)
  }
}
