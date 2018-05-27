export interface ITimeLog {
  spentTime: number,
  spentAt: Date,
}

export interface ITimeLogDetail extends ITimeLog {
  gitlabUser: string,
  issueDocId: string,
  projectDocId: string,
  createdAt: Date,
}

export interface ITimeLogDoc extends ITimeLogDetail {
  docId: string
}

export interface IIssueInfo {
  type: string,
  project: string,
  num: number,
  createdBy: string,
  issueCreatedAt: Date,
  title: string
}

export interface IIssuePageInfo {
  curGitlabUser: string,
  curIssue: IIssueInfo
}

///////////////////////////////////////////////////

export interface ITimeLoggerBoxState {
  timeLogs: Array<ITimeLogDoc>
}

export interface ITimeLogItemProps {
  timeLog: ITimeLogDoc,
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
