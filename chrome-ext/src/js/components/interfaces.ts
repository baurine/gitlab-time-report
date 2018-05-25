export interface ITimeLog {
  spentTime: number,
  createdAt: Date
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
