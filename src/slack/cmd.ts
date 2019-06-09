import {
  ChatPostMessageArguments,
  WebAPICallResult,
  WebClient,
} from '@slack/client'

import * as models from './models'
import { ojichat } from '../ojichat'
import {
  getVersion,
  isChannelInfoResult,
  isReactionItemFile,
  isReactionItemFileComment,
  isReactionItemMessage,
  isReactionListResult,
  isUserID,
  isUserInfoResult,
  Map2,
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

export const reactionListCmd = async (
  args: string[],
  web: WebClient,
  ev: models.UserMessageEvent
): Promise<ChatPostMessageArguments> => {
  const user = await (async (
    target: string | undefined
  ): Promise<WebAPICallResult> => {
    if (target && isUserID(target)) {
      return web.users.info({
        user: target.replace(/<\@(U\w{8})>/, '$1'),
      })
    } else {
      return web.users.info({ user: ev.user })
    }
  })(args[0])

  const reaction = await (async (
    user: WebAPICallResult
  ): Promise<WebAPICallResult> => {
    if (isUserInfoResult(user)) {
      return await web.reactions.list({ full: true, user: user.user.id })
    } else {
      return await web.reactions.list({ full: true, user: ev.user })
    }
  })(user)

  if (isReactionListResult(reaction)) {
    const [map] = reaction.items.reduce(
      (acc, x): [Map2<string, number>, Set<string>] => {
        if (
          isReactionItemFile(x) && // typeguard
          !acc[1].has(x.file.id) && // 重複排除
          x.file.reactions // typeguard
        ) {
          x.file.reactions.forEach(
            (elem): void => {
              acc[0].set(elem.name, acc[0].getOrElse(elem.name, 0) + 1)
            }
          )
          acc[1].add(x.file.id)
        } else if (isReactionItemFileComment(x) && !acc[1].has(x.comment.id)) {
          x.comment.reactions.forEach(
            (elem): void => {
              acc[0].set(elem.name, acc[0].getOrElse(elem.name, 0) + 1)
            }
          )
          acc[1].add(x.file.id)
        } else if (isReactionItemMessage(x)) {
          // messageはidが無いのでtsを代用する
          if (x.message.reactions && !acc[1].has(x.message.ts)) {
            x.message.reactions.forEach(
              (elem): void => {
                acc[0].set(elem.name, acc[0].getOrElse(elem.name, 0) + 1)
              }
            )
          }
          acc[1].add(x.message.ts)
        }
        return acc
      },
      [new Map2() as Map2<string, number>, new Set() as Set<string>]
    )

    const mention = ((user: WebAPICallResult): string => {
      if (isUserInfoResult(user)) {
        return `@${user.user.name}`
      } else {
        return ':thinking_face:'
      }
    })(user)

    const text = Array.from(map.entries())
      .sort(
        (a, b): number => {
          return b[1] - a[1]
        }
      )
      .slice(0, 10)
      .reduce((acc, x): string => {
        return `${acc}\n:${x[0]}: => ${x[1]}`
      }, `${mention} のリアクションランキング TOP10`)

    return {
      text,
      channel: ev.channel,
      as_user: false,
      link_names: true,
    }
  } else {
    return Promise.reject(`failed to fetch reaction.list API (${reaction})`)
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
    '  $ ojichat [me/rand/@target]',
    '    summon Ojisan for [NPC(default), you, @target(NSFW), random member in this channel(NSFW)]',
    '    example: `ojicaht rand -c 100` => repeat ojichat(incl lottery) for random member 100 times',
    '  $ reaction [@target] (experimental)',
    "    show user(default: you)'s reaction statistics from latest 100 usage",
    '  $ version show version',
    '  $ help show this message',
    'passive skills:',
    '  - notify emoji event',
    '  - notify channel event',
    '  - notify member join event',
    '  - notify member left event',
    '  - notify excel file upload(experimental)',
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
