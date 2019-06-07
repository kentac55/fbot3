import * as util from 'util'
import * as fs from 'fs'

import { WebAPICallResult } from '@slack/client'

import * as models from './models'

export const isUserID = (id: string): boolean => {
  if (id.match(/<\@U\w{8}>/)) {
    return true
  } else {
    return false
  }
}

export const isUserInfoResult = (
  result: WebAPICallResult
): result is models.UserInfoResult => {
  return result.ok
}

export const isChannelInfoResult = (
  result: WebAPICallResult
): result is models.ChannelInfoResult => {
  return result.ok
}

export const isUserMessageEvent = (
  ev: models.MessageEvent
): ev is models.UserMessageEvent => {
  return !ev.subtype
}

export const isValidTuple = (
  res: [WebAPICallResult, WebAPICallResult]
): res is [models.ChannelInfoResult, models.UserInfoResult] => {
  return (
    [isChannelInfoResult(res[0]), isUserInfoResult(res[1])].filter(
      (elem, idx, self): boolean => {
        return self.indexOf(elem) === idx
      }
    ) === [true]
  )
}

export type A1<T> = [T, ...T[]]

export const isOneOrMore = <T>(a: T[]): a is A1<T> => {
  return a.length > 0
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, ms))
}

export const getVersion = async (): Promise<string> => {
  const readFile = util.promisify(fs.readFile)
  try {
    const data = await readFile('./package.json', { encoding: 'utf8' })
    const json = JSON.parse(data)
    const text = json.version
    return text
  } catch (e) {
    return Promise.reject(e)
  }
}
