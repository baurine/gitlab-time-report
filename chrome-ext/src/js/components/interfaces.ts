export interface ITimeLog {
  spentTime: number,
  spentAt: Date,
  createdAt: Date,
}

export interface ITimeLogDetail extends ITimeLog {
  user: string,
  issueDocId: string,
  projectDocId: string,
}

export interface ITimeLogDoc extends ITimeLogDetail {
  docId: string
}

///////////////////////////////////////////////////

export interface ITimeLogItemProps {
  timeLog: ITimeLogDoc,
  onDelete?: (timeLog: ITimeLogDoc) => void,
  onUpdate?: (timeLog: ITimeLogDoc) => void
}

export interface ITimeLoggerBoxState {
  timeLogs: Array<ITimeLogDoc>
}

export interface ITimeLogEditorState {
  spentTime: string,
  spentAt: string,
}

export interface ITimeLogEditorProps {
  onAdd?: (timeLog: ITimeLog) => void
}
