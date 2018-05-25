export interface ITimeLog {
  spentTime: number,
  createdAt: Date,
  user: string,
  issueDocId: string,
  projectDocId: string,
}

export interface ITimeLogDoc extends ITimeLog {
  docId: string
}

export interface ITimeLogItemProps {
  timeLog: ITimeLogDoc,
  onDelete?: (timeLog: ITimeLogDoc) => void,
  onUpdate?: (timeLog: ITimeLogDoc) => void
}

export interface ITimeLoggerBoxState {
  spentTime: string,
  timeLogs: Array<ITimeLogDoc>
}
