export interface ITimeLog {
  spentTime: number,
  createdAt: Date
}

export interface ITimeLogItemProps {
  timeLog: ITimeLog,
  onDelete?: (timeLog: ITimeLog) => void,
  onUpdate?: (timeLog: ITimeLog) => void
}

export interface ITimeLoggerBoxState {
  spentTime: string,
  timeLogs: Array<ITimeLog>
}
