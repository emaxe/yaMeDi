export class PromiseQueue {
  private concurrency: number
  private running = 0
  private queue: Array<() => void> = []

  constructor(concurrency: number) {
    this.concurrency = concurrency
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running < this.concurrency) {
      return this.run(fn)
    }
    return new Promise((resolve, reject) => {
      this.queue.push(() => {
        this.run(fn).then(resolve, reject)
      })
    })
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    this.running += 1
    try {
      return await fn()
    } finally {
      this.running -= 1
      this.next()
    }
  }

  private next() {
    if (this.queue.length === 0) return
    const next = this.queue.shift()
    next?.()
  }
}
