export interface IParsedTimeNote {
  id: number,
  author: string,
  spent_date: string,
  spent_time: number,
}

export interface ITimeNote extends IParsedTimeNote {
  issue_doc_id: string,
  project_id: number
}

export interface IIssueRes {
  // come from api response
  // won't change
  id: number,
  iid: number,
  project_id: number,

  sha: string, // for judge whether this is a issue or merge request

  // may change
  title: string,
  description: string,
  web_url: string,
  time_stats: {
    total_time_spent: number,
  }
}

export interface IIssue {
  id: number,
  iid: number,
  project_id: number,

  title: string,
  description: string,
  web_url: string,
  total_time_spent: number,

  type: string, // 'issue' or 'merge_request'
  last_note_id: number,
  latest_spent_date: string,
  doc_id: string,  // id-iid-project_id
}

export interface IProject {
  id: number,
  name: string,
}

export interface IProfile {
  // won't change
  id: number,
  email: string,
  username: string,

  // may change
  name: string,
}

export interface IIssuePageInfo {
  curDomainDocId: string,
  curIssue: IIssue,
  curProject: IProject,
  curUser: IProfile
}

export interface IDomain {
  doc_id: string,
  enabled: boolean
}

export interface IAggreReport {
  users: string[],
  dates: string[],
}

export interface IReportMeta {
  type: string,
  id: number | string,
  name: string,
  link: string,
}
