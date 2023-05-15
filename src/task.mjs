import { EventEmitter } from "node:events"

export class Task extends EventEmitter {
  /** @typedef {() => Promise<void>} Callback */

  /** @type {string} */
  _id = (Math.random() + 1).toString(36).substring(7)

  /** @type {Callback} */
  _callback

  /** enum for different task status */
  static status = {
    Pending: "Pending",
    Starting: "Starting",
    Complete: "Complete",
    Failure: "Failure",
  }

  /** @type {Task.status[keyof typeof Task.status]} */
  _currentStatus = "Pending"

  /**
   * @param {Callback} callback 
   */
  constructor(callback) {
    super()
    this._callback = this._decorateCallback(callback)
  }

  /** @returns {string} */
  get id() {
    return this._id
  }

  /** @param {Task.status[keyof typeof Task.status]} status */
  _emitStatus(status) {
    this.emit(status)
    this._currentStatus = status
  }

  /**
   * @param {Callback} callback
   * @returns {Callback}
   */
  _decorateCallback(callback) {
    return async () => {
      this._emitStatus(Task.status.Starting)
      try {
        await callback()
        this._emitStatus(Task.status.Complete)
      } catch {
        this._emitStatus(Task.status.Failure)
      }
    }
  }

  /** @returns {Promise<void>} */
  async execute() {
    if (this._currentStatus === Task.status.Pending) {
      return this._callback()
    }
  }
}