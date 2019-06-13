import * as util from 'util'
import * as fs from 'fs'

import { WebAPICallResult } from '@slack/client'

import { A1, isOneOrMore } from '../utils'
import * as models from './models'
import { ItemKind } from './kinds'

export const isUserID = (id: string): boolean => {
  if (id.match(/<\@U\w{8}(|.+)?>/)) {
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

export const isReactionListResult = (
  result: WebAPICallResult
): result is models.ReactionListResult => {
  return result.ok
}

export const isFileInfoResult = (
  result: WebAPICallResult
): result is models.FileInfoResult => {
  return result.ok
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

export const isReactionItemFileComment = (
  item: models.ReacttionListItem
): item is models.ReactionItemFileComment => {
  return !item.hasOwnProperty('type')
}

export const isReactionItemFile = (
  item: models.ReacttionListItem
): item is models.ReactionItemFile => {
  return !isReactionItemFileComment(item) && item.type === ItemKind.File
}

export const isReactionItemMessage = (
  item: models.ReacttionListItem
): item is models.ReactionItemMessage => {
  return !isReactionItemFileComment(item) && item.type === ItemKind.Message
}

export class Map2<K, V> extends Map<K, V> {
  public getOrElse = (key: K, missing: V): V => {
    const v = this.get(key)
    if (typeof v === 'undefined') {
      return missing
    } else {
      return v
    }
  }
}

export const trim = (str: string): string => {
  return str.replace(/\.$/, '').replace(/ +/g, ' ')
}

export const reminderHandler = (strs: string[]): string[] => {
  if (strs[0] === 'Reminder:') {
    strs.shift()
  } else if (strs[0] === 'リマインダー' && strs[1] === ':') {
    strs.shift()
    strs.shift()
  }
  return strs
}

export const extractCount = (strs: A1<string>): [A1<string>, number] => {
  const idx = strs.findIndex(
    (elem): boolean => {
      return /\-c/.test(elem)
    }
  )

  // default value
  if (idx === -1) {
    return [strs, 1]
  }

  const head = strs.slice(0, idx)
  const tail = strs.slice(idx + 2, strs.length)
  head.push.apply(head, tail)

  if (isOneOrMore(head)) {
    try {
      return [head, parseInt(strs[idx + 1])]
    } catch {
      return [head, 1]
    }
  } else {
    // つかれた(明らかに手抜きだが、摩擦はないものとする)
    try {
      return [strs, parseInt(strs[idx + 1])]
    } catch {
      return [strs, 1]
    }
  }
}

export const parse = (str: string): Command => {
  const invalidCommand: InvalidCommand = {
    isCmd: false,
    input: str,
  }

  const formatted = reminderHandler(trim(str).split(' '))
  if (formatted[0] === '$') {
    formatted.shift()
  } else {
    return invalidCommand
  }

  if (!isOneOrMore(formatted)) {
    return invalidCommand
  }

  const [strs, runs] = extractCount(formatted)

  return {
    isCmd: true,
    input: str,
    cmd: strs[0],
    args: strs.slice(1),
    runs,
  }
}

export type Command = ValidCommand | InvalidCommand

export type InvalidCommand = {
  isCmd: false
  input: string
}

export type ValidCommand = {
  isCmd: true
  input: string
  cmd: string
  args: string[]
  runs: number
}
