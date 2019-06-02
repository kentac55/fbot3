import * as Url from 'url'
import * as Process from 'process'
import * as Http from 'http'
import { RTMClient } from '@slack/client'
import HttpsProxyAgent from 'https-proxy-agent'

const getToken = (): string => {
  if (Process.env.SLACK_TOKEN) {
    return Process.env.SLACK_TOKEN
  } else {
    throw new Error('Missing token')
  }
}

const getWTMClient = (token: string): RTMClient => {
  if (Process.env.http_proxy) {
    const url = Url.parse(Process.env.http_proxy)
    if (url.hostname && url.port) {
      const port = parseInt(url.port)
      if (port) {
        const proxyOpt = {
          host: url.hostname,
          port: port,
        }
        const agent = new HttpsProxyAgent(proxyOpt) as Http.Agent
        return new RTMClient(token, { agent })
      }
    }
  }
  return new RTMClient(token)
}

const rtm: RTMClient = getWTMClient(getToken())

rtm.on(
  'authenticated',
  (): void => {
    console.log('ok')
  }
)

rtm.start()
