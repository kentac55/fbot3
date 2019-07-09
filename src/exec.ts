import * as cp from 'child_process'

export const exec = (cmd: string, args: string[]): Promise<string> => {
  return new Promise((resolve, reject): void => {
    const t: cp.ChildProcess = cp.spawn(cmd, args)
    setTimeout((): void => {
      t.kill()
      reject(`\`timeout(cmd: '${cmd}', args: '${args}')\``)
    }, 5000)
    const stdout: string[] = []
    const stderr: string[] = []
    if (t.stdout) {
      t.stdout.on('data', (data): void => {
        const str = data.toString()
        stdout.push(str)
      })
    }
    if (t.stderr) {
      t.stderr.on('data', (data): void => {
        const str = data.toString()
        stderr.push(str)
      })
    }
    t.once('error', (e): void => {
      if (t.stdout) {
        t.stdout.removeAllListeners()
      }
      if (t.stderr) {
        t.stderr.removeAllListeners()
      }
      reject(e)
    })
    t.once('close', (): void => {
      if (t.stdout) {
        t.stdout.removeAllListeners()
      }
      if (t.stderr) {
        t.stderr.removeAllListeners()
      }
      if (stderr.length === 0) {
        resolve(stdout.join('\n'))
      } else {
        reject(stderr.join('\n'))
      }
    })
  })
}
