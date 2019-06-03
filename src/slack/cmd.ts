import {
  WebClient,
  ChatPostMessageArguments,
  WebAPICallResult,
} from '@slack/client'
import * as models from './models'
import { ojichat } from '../ojichat'
import { isUserID } from './utils'

export const ojichatCmd = async (
  args: string[],
  web: WebClient,
  ev: models.UserMessageEvent,
  me: models.Self
): Promise<ChatPostMessageArguments> => {
  const _channel = await web.channels.info({ channel: ev.channel })
  const channel = _channel.ok ? (_channel as models.ChannelInfoResult) : null
  if (channel === null) {
    return Promise.reject(`failed to fetch channel info(id: ${ev.channel})`)
  }
  const _user = await (async (
    target: string | undefined
  ): Promise<WebAPICallResult> => {
    if (target && isUserID(target)) {
      return web.users.info({
        user: target.replace(/<\@(U\w{8})>/, '$1'),
      })
    } else if (target && target === 'me') {
      return web.users.info({ user: ev.user })
    } else {
      const users = channel.channel.members.filter(
        (elem: string): boolean => {
          return elem !== me.id
        }
      )
      const rand = Math.floor(Math.random() * Math.floor(users.length))
      const target = users[rand]
      return web.users.info({ user: target })
    }
  })(args.shift())
  const user = _user.ok ? (_user as models.UserInfoResult) : null
  if (user === null) {
    return Promise.reject(`failed to fetch user info`)
  }
  const name = user.user.name
  const result = await ojichat(name)
  const text = result
    .replace(new RegExp(`(${name})`), ' @$1 ')
    .replace(/裸/, '<CENSORED #8>')
  return {
    text,
    channel: ev.channel,
    as_user: false,
    link_names: true,
    username: 'おぢさん',
    icon_emoji: ':brain:',
  }
}

export const helpCmd = async (
  ev: models.UserMessageEvent
): Promise<ChatPostMessageArguments> => {
  const text = [
    'usage:',
    '  $ ojichat [@target/me]\tcall ojichat',
    '  $ help\t\t\t\t\tshow this message',
  ].join('\n')
  return {
    text,
    channel: ev.channel,
    as_user: true,
    link_names: true,
  }
}
