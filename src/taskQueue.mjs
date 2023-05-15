import { EventEmitter } from "node:events"
import { Task } from "./task.mjs"
const { log } = console

export class TaskQueue {
  /** @type {Task[]} */
  _tasks = []

  /** @type {Task[]} */
  failedTasks = []

  /** @type {number} */
  _maxParallel

  /** report status related to current queue state */
  _statusEmitter = new EventEmitter()

  /** enum for different queue status */
  static _status = {
    Done: "Done",
  }

  /** 
   * @param {number} maxParallel 
   * */
  constructor(maxParallel) {
    this._maxParallel = maxParallel
  }

  /** @param {Task} task */
  add(task) {
    task.on(Task.status.Starting, () => log("starting", task.id))

    task.on(Task.status.Complete, () => {
      log("Complete", task.id)
      this._removeTask(task.id)
      this._checkAndReportComplete()
    })

    task.on(Task.status.Failure, () => {
      log("Failure", task.id)
      this._removeTask(task.id)
      this.failedTasks.push(task)
      this._checkAndReportComplete()
    })

    this._tasks.push(task)
  }

  /** @param {string} taskId */
  _removeTask(taskId) {
    this._tasks = this._tasks.filter(t => t.id !== taskId)
  }

  /** @returns {void} */
  _checkAndReportComplete() {
    /** process the next item, if available */
    if (this._tasks[0]) {
      this._tasks[0].execute()
    }

    if (this._tasks.length === 0) {
      this._statusEmitter.emit(TaskQueue._status.Done)
    }
  }

  /** @returns {Promise<void>} */
  process() {
    return new Promise(async (resolve) => {
      for (let i = 0; i < this._maxParallel; i++) {
        this._tasks[i]?.execute()
      }

      this._statusEmitter.on(TaskQueue._status.Done, resolve)
    })
  }
}