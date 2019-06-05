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