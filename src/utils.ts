import * as Url from 'url'
import * as Http from 'http'
import * as Process from 'process'

import { RTMClient, WebClient } from '@slack/client'
import HttpsProxyAgent from 'https-proxy-agent'

export const getTokenFromEnv = (): string => {
  if (Process.env.SLACK_TOKEN) {
    return Process.env.SLACK_TOKEN
  } else {
    throw new Error('Missing token')
  }
}

export const getChannel = (): string => {
  if (Process.env.SLACK_CHANNEL) {
    return Process.env.SLACK_CHANNEL
  } else {
    throw new Error('Missing channel')
  }
}

export const getClients = (token: string): [RTMClient, WebClient] => {
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
        return [
          new RTMClient(token, { agent }),
          new WebClient(token, { agent }),
        ]
      }
    }
  }
  return [new RTMClient(token), new WebClient(token)]
}
