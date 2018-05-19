export interface ITimeLogger {
  id: number,
  spentTime: string
}

export interface ITimeLoggerBoxState {
  spentTime: string,
  timeLoggers: Array<ITimeLogger>
}

export interface ITimeLoggerItemProps {
  timeLogger: ITimeLogger,
  onDelete?: (timeLogger: ITimeLogger) => void,
  onEdit?: (timeLogger: ITimeLogger) => void
}
