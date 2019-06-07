import {
  ChatPostMessageArguments,
  WebAPICallResult,
  WebClient,
} from '@slack/client'

import * as models from './models'
import { ojichat } from '../ojichat'
import {
  isUserID,
  isChannelInfoResult,
  isUserInfoResult,
  getVersion,
} from './utils'

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
  })(args[0])
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
  const text = await getVersion()
  return {
    text,
    channel: ev.channel,
    as_user: true,
    link_names: true,
  }
}

export const helpCmd = async (
  ev: models.UserMessageEvent
): Promise<ChatPostMessageArguments> => {
  const text = [
    '```',
    'active skills:',
    '  $ ojichat [me/rand/@target] [-c <number>]',
    '    summon Ojisan(40yo) for [NPC(default), you, @target(NSFW), random member in this channel(NSFW)]',
    '    example: `ojicaht rand -c 100` => repeat ojichat(incl lottery) for random member 100 times',
    '  $ version [-c <number>]show version',
    '  $ help [-c <number>]   show this message',
    'passive skills:',
    '  - notify emoji event',
    '  - notify channel event',
    '  - notify member join event(global skill)',
    '  - notify member left event(global skill)',
    '```',
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
