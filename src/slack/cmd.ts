import * as util from 'util'
import * as fs from 'fs'

import {
  WebClient,
  ChatPostMessageArguments,
  WebAPICallResult,
} from '@slack/client'

import * as models from './models'
import { ojichat } from '../ojichat'
import { isUserID, isChannelInfoResult, isUserInfoResult } from './utils'

export const ojichatCmd = async (
  args: string[],
  web: WebClient,
  ev: models.UserMessageEvent,
  me: models.Self
): Promise<ChatPostMessageArguments> => {
  const channel = await web.channels.info({ channel: ev.channel })
  const user = await (async (
    target: string | undefined
  ): Promise<WebAPICallResult | null> => {
    if (isChannelInfoResult(channel)) {
      if (target && isUserID(target)) {
        return web.users.info({
          user: target.replace(/<\@(U\w{8})>/, '$1'),
        })
      } else if (target && target === 'me') {
        return web.users.info({ user: ev.user })
      } else if (target && target === 'rand') {
        const users = channel.channel.members.filter(
          (elem: string): boolean => {
            return elem !== me.id
          }
        )
        const rand = Math.floor(Math.random() * Math.floor(users.length))
        const target = users[rand]
        return web.users.info({ user: target })
      } else {
        return Promise.resolve(null)
      }
    } else {
      return Promise.reject(`failed to fetch channel info(id: ${ev.channel})`)
    }
  })(args.shift())
  const ojichatArg = ((
    user: WebAPICallResult | null
  ): string | null | undefined => {
    if (user === null) {
      return null
    } else if (isUserInfoResult(user)) {
      return user.user.name
    } else {
      return undefined
    }
  })(user)
  if (ojichatArg === undefined) {
    return Promise.reject(`failed to fetch user info`)
  } else {
    const text = (await ojichat(ojichatArg))
      .replace(/裸/, '<CENSORED #8>')
      .replace(new RegExp(`(${ojichatArg})`), ' @$1 ')
    return {
      text,
      channel: ev.channel,
      as_user: false,
      link_names: true,
      username: 'おぢさん',
      icon_emoji: ':brain:',
    }
  }
}

export const versionCmd = async (
  ev: models.UserMessageEvent
): Promise<ChatPostMessageArguments> => {
  const readFile = util.promisify(fs.readFile)
  try {
    const data = await readFile('./package.json', { encoding: 'utf8' })
    const json = JSON.parse(data)
    const text = json.version
    return {
      text,
      channel: ev.channel,
      as_user: true,
      link_names: true,
    }
  } catch (e) {
    return Promise.reject(e)
  }
}

export const helpCmd = async (
  ev: models.UserMessageEvent
): Promise<ChatPostMessageArguments> => {
  const text = [
    'active skills:',
    '  $ ojichat [@target/me]\tcall ojichat:heart: for random/@target/you',
    '  $ version\t\t\t\t show version',
    '  $ help\t\t\t\t\tshow this message',
    'passive skills:',
    '  - notify emoji event',
    '  - notify channel event',
    // '',
    // 'https://github.com/kentac55/fbot3',
  ].join('\n')
  return {
    text,
    channel: ev.channel,
    as_user: true,
    link_names: true,
  }
}
