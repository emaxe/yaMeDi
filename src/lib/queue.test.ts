import { describe, expect, it } from 'vitest'

import { PromiseQueue } from './queue'

describe('PromiseQueue', () => {
  it('limits concurrent executions', async () => {
    const queue = new PromiseQueue(2)
    let running = 0
    let maxRunning = 0

    const tasks = Array.from({ length: 5 }, (_, i) =>
      queue.add(async () => {
        running += 1
        maxRunning = Math.max(maxRunning, running)
        await new Promise((resolve) => setTimeout(resolve, 10))
        running -= 1
        return i
      })
    )

    const results = await Promise.all(tasks)
    expect(results).toEqual([0, 1, 2, 3, 4])
    expect(maxRunning).toBe(2)
  })

  it('propagates errors', async () => {
    const queue = new PromiseQueue(1)
    await expect(queue.add(async () => { throw new Error('fail') })).rejects.toThrow('fail')
  })
})
