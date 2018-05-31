export interface ITimeLog {
  spentTime: number,
  spentAt: Date,
}

export interface ITimeLogDetail extends ITimeLog {
  gitlabUser: string,
  issueDocId: string,
  project: string,
  createdAt: Date,
}

export interface ITimeLogDoc extends ITimeLogDetail {
  docId: string
}

export interface IIssueInfo {
  // won't change forever
  type: string,
  num: number,
  createdBy: string,
  issueCreatedAt: Date,
  // maybe change
  project: string,
  title: string
}

export interface IIssueDoc extends IIssueInfo {
  docId: string
}

export interface IIssuePageInfo {
  curGitlabUser: string,
  curIssue: IIssueInfo
}

///////////////////////////////////////////////////

export interface ITimeLoggerBoxProps {
  issuePageInfo: IIssuePageInfo,
}

export interface ITimeLoggerBoxState {
  timeLogs: Array<ITimeLogDoc>,
  issueDoc: IIssueDoc,
  message: string
}

export interface ITimeLogItemProps {
  timeLog: ITimeLogDoc,
  enableEdit: boolean,
  onDelete?: (timeLog: ITimeLogDoc) => void,
  onUpdate?: (timeLog: ITimeLogDoc) => void
}

export interface ITimeLogEditorProps {
  timeLog?: ITimeLogDoc
  onAdd?: (timeLog: ITimeLog) => void,
  onUpdate?: (timeLog: ITimeLogDoc) => void
  onCancel?: () => void
}

export interface ITimeLogEditorState {
  spentTime: string,
  spentAt: string,
}

export interface IAuthBoxProps {
  curGitlabUser?: string
}

export interface IAuthBoxState {
  user: any,
  email: string,
  password: string,
  loading: boolean,
  message: string
}

export interface IReportBoxState {
  users: string[],
  projects: string[],
  selectedUser: string,
  selectedProject: string,
  dateFrom: string,
  dateTo: string,
  aggreResult: object | string,
  message: string
}
