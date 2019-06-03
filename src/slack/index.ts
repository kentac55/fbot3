import {
  RTMClient,
  WebClient,
  ChatPostMessageArguments,
  MessageAttachment,
  WebAPICallResult,
} from '@slack/client'
import pino from 'pino'
import { EventKind, EmojiEventKind } from './kinds'
import * as models from './models'
import { ojichat } from '../ojichat'

export const registerEventHandlers = (
  rtm: RTMClient,
  web: WebClient,
  log: pino.Logger,
  channel: string
): void => {
  let me: models.Self
  const msgBase = {
    channel,
    as_user: true,
    link_names: true,
  }
  rtm.on(
    EventKind.Authenticated,
    (ev: models.ConnectedEvent): void => {
      const _log = log.child({ event: EventKind.Authenticated })
      me = ev.self
      _log.info(ev)
    }
  )
  rtm.on(
    EventKind.EmojiChanged,
    (ev: models.EmojiEvent): void => {
      const _log = log.child({
        event: EventKind.EmojiChanged,
        subevent: ev.subtype,
      })
      if (ev.subtype === EmojiEventKind.Add) {
        const attachment: MessageAttachment = {
          color: '#36a64f',
          title: `${ev.name}`,
          image_url: ev.value,
        }
        const msg: ChatPostMessageArguments = Object.assign(
          {
            text: `:${ev.name}:`,
            attachments: [attachment],
          },
          msgBase
        )
        web.chat
          .postMessage(msg)
          .then(
            (result: WebAPICallResult): void => {
              _log.info(result)
            }
          )
          .catch(
            (e: Error): void => {
              _log.error(e)
            }
          )
      } else if (ev.subtype === EmojiEventKind.Remove) {
        ev.names.forEach(
          (name: string): void => {
            const msg: ChatPostMessageArguments = Object.assign(
              {
                text: `:${name}: has been removed`,
              },
              msgBase
            )
            web.chat
              .postMessage(msg)
              .then(
                (result: WebAPICallResult): void => {
                  _log.info(result)
                }
              )
              .catch(
                (e: Error): void => {
                  _log.error(e)
                }
              )
          }
        )
      } else {
        const _: never = ev
        new Error(_)
      }
    }
  )
  rtm.on(
    EventKind.ChannelArchive,
    (ev: models.ChannelArchiveEvent): void => {
      const _log = log.child({ event: EventKind.ChannelArchive })
      Promise.all([
        web.channels.info({ channel: ev.channel }),
        web.users.info({ user: ev.user }),
      ])
        .then(
          (
            tuple: [WebAPICallResult, WebAPICallResult]
          ): Promise<ChatPostMessageArguments> => {
            const [_channel, _user] = tuple
            const channel = _channel.ok
              ? (_channel as models.ChannelInfoResult)
              : null
            const user = _user.ok ? (_user as models.UserInfoResult) : null
            if (channel && user) {
              const msg: ChatPostMessageArguments = Object.assign(
                {
                  text: `:skull: channel(#${
                    channel.channel.name
                  }) has been archived by @${user.user.name}`,
                },
                msgBase
              )
              return Promise.resolve(msg)
            } else if (channel) {
              return Promise.reject(`Cannot find user: ${ev.user}`)
            } else if (user) {
              return Promise.reject(`Cannot find channel: ${ev.channel}`)
            } else {
              return Promise.reject(
                `Cannot find user: ${ev.user} and channel: ${ev.channel}`
              )
            }
          }
        )
        .then(
          (msg: ChatPostMessageArguments): Promise<WebAPICallResult> => {
            return web.chat.postMessage(msg)
          }
        )
        .then(
          (result: WebAPICallResult): void => {
            _log.info(result)
          }
        )
        .catch(
          (e: Error): void => {
            _log.error(e)
          }
        )
    }
  )
  rtm.on(
    EventKind.ChannelCreated,
    (ev: models.ChannelCreatedEvent): void => {
      const _log = log.child({ event: EventKind.ChannelCreated })
      web.users
        .info({ user: ev.channel.creator })
        .then(
          (_user: WebAPICallResult): Promise<ChatPostMessageArguments> => {
            const user = _user.ok ? (_user as models.UserInfoResult) : null
            if (user) {
              const msg: ChatPostMessageArguments = Object.assign(
                {
                  text: `:baby: channel created. #${ev.channel.name} by @${
                    user.user.name
                  }`,
                },
                msgBase
              )
              return Promise.resolve(msg)
            } else {
              return Promise.reject(`Cannot find user: ${ev.channel.creator}`)
            }
          }
        )
        .then(
          (msg: ChatPostMessageArguments): Promise<WebAPICallResult> => {
            return web.chat.postMessage(msg)
          }
        )
        .then(
          (result: WebAPICallResult): void => {
            _log.info(result)
          }
        )
        .catch(
          (e: Error): void => {
            _log.error(e)
          }
        )
    }
  )
  rtm.on(
    EventKind.ChannelDeleted,
    (ev: models.ChannelDeleted): void => {
      const _log = log.child({ event: EventKind.ChannelDeleted })
      const msg: ChatPostMessageArguments = Object.assign(
        {
          text: `:cop: channel(id: ${
            ev.channel
          }) has been *deleted* by *admin*`,
        },
        msgBase
      )
      web.chat
        .postMessage(msg)
        .then(
          (result: WebAPICallResult): void => {
            _log.info(result)
          }
        )
        .catch(
          (e: Error): void => {
            _log.error(e)
          }
        )
    }
  )
  rtm.on(
    EventKind.ChannelRename,
    (ev: models.ChannelRenameEvent): void => {
      const _log = log.child({ event: EventKind.ChannelRename })
      const msg: ChatPostMessageArguments = Object.assign(
        {
          text: `:writing_hand: one channel has been renamed to #${
            ev.channel.name
          }`,
        },
        msgBase
      )
      web.chat
        .postMessage(msg)
        .then(
          (result: WebAPICallResult): void => {
            _log.info(result)
          }
        )
        .catch(
          (e: Error): void => {
            _log.error(e)
          }
        )
    }
  )
  rtm.on(
    EventKind.ChannelUnarchive,
    (ev: models.ChannelUnarchiveEvent): void => {
      const _log = log.child({ event: EventKind.ChannelUnarchive })
      Promise.all([
        web.channels.info({ channel: ev.channel }),
        web.users.info({ user: ev.user }),
      ])
        .then(
          (
            tupled: [WebAPICallResult, WebAPICallResult]
          ): Promise<ChatPostMessageArguments> => {
            const [_channel, _user] = tupled
            const channel = _channel.ok
              ? (_channel as models.ChannelInfoResult)
              : null
            const user = _user.ok ? (_user as models.UserInfoResult) : null
            if (channel && user) {
              const msg: ChatPostMessageArguments = Object.assign(
                {
                  text: `:zombie: channel(#${
                    channel.channel.name
                  }) has been unarchived by @${user.user.name}`,
                },
                msgBase
              )
              return Promise.resolve(msg)
            } else if (channel) {
              return Promise.reject(`Cannot find user: ${ev.user}`)
            } else if (user) {
              return Promise.reject(`Cannot find channel: ${ev.channel}`)
            } else {
              return Promise.reject(
                `Cannot find user: ${ev.user} and channel: ${ev.channel}`
              )
            }
          }
        )
        .then(
          (msg: ChatPostMessageArguments): Promise<WebAPICallResult> => {
            return web.chat.postMessage(msg)
          }
        )
        .then(
          (result: WebAPICallResult): void => {
            _log.info(result)
          }
        )
        .catch(
          (e: Error): void => {
            _log.error(e)
          }
        )
    }
  )

  rtm.on(
    EventKind.Message,
    (ev: models.MessageEvent): void => {
      const _log = log.child({ event: EventKind.Message })
      _log.info(ev)
      if (ev.subtype) {
        return
      }
      if (typeof ev.text !== 'string') {
        console.error(`type of ev.text is ${typeof ev.text}`)
        return
      }
      const _ev = ev as models.UserMessageEvent
      const strs = ev.text.replace(/\.$/, '').split(' ')
      if (strs[0] === 'Reminder:') {
        strs.shift()
      } else if (strs[0] === 'リマインダー' && strs[1] === ':') {
        strs.shift()
        strs.shift()
      }
      if (strs[0] !== '$') {
        _log.info('not cmd message')
        return
      } else {
        strs.shift()
      }
      const cmdResult = async (
        cmd: string
      ): Promise<ChatPostMessageArguments> => {
        switch (cmd) {
          case 'ojichat': {
            return web.channels
              .info({ channel: ev.channel })
              .then(
                (res: WebAPICallResult): Promise<WebAPICallResult> => {
                  const channel = res.ok
                    ? (res as models.ChannelInfoResult)
                    : null
                  if (channel === null) {
                    return Promise.reject(
                      `failed to fetch channel info(id: ${ev.channel})`
                    )
                  }
                  const users = channel.channel.members.filter(
                    (elem: string): boolean => {
                      return elem !== me.id
                    }
                  )
                  const targetNum = Math.floor(
                    Math.random() * Math.floor(users.length)
                  )
                  const target = users[targetNum]
                  return web.users.info({ user: target })
                }
              )
              .then(
                async (
                  res: WebAPICallResult
                ): Promise<ChatPostMessageArguments> => {
                  const user = res.ok ? (res as models.UserInfoResult) : null
                  if (user === null) {
                    return Promise.reject(`failed to fetch user info`)
                  }
                  const name = user.user.name
                  const result = await ojichat(name)
                  const text = result
                    .replace(new RegExp(`(${name})`), ' @$1 ')
                    .replace(/裸/, '<CENSORED #8>')
                  return Promise.resolve({
                    text,
                    channel: ev.channel,
                    as_user: true,
                    link_names: true,
                  })
                }
              )
          }
          default: {
            return Promise.reject('unmatched')
          }
        }
      }
      const order = strs.shift()
      if (!order) {
        return
      }
      cmdResult(order)
        .then(
          (msg: ChatPostMessageArguments): Promise<WebAPICallResult> => {
            return web.chat.postMessage(msg)
          }
        )
        .then(
          (result: WebAPICallResult): void => {
            _log.info(result)
          }
        )
        .catch(
          (e: Error): void => {
            _log.error(e)
          }
        )
    }
  )
}
