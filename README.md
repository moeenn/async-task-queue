# Async Task Queue
Implementation of an Async Task Queue with support for max parallel promises.

### Usage
```javascript
import { Task, TaskQueue } from "./TaskQueue/index.mjs"

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms))

/** @param {number} id */
async function task(id) {
  const ms = Math.floor(Math.random() * 2000)
  await sleep(ms)

  /** one the task fails */
  if (id === 6) throw new Error("failure")
}

/** @returns {Promise<void>} */
async function main() {
  const queue = new TaskQueue(4)

  for (let i = 0; i < 10; i++) {
    const task = new Task(() => task(i))
    queue.add(task)
  }

  /** only resolves when all tasks have been processed */
  await queue.process()
  console.log(queue.failedTasks.map(t => t.id))
}

main().catch(console.error)
```

**Note**: This project has no external dependencies.