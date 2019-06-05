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
import { ojichatCmd, helpCmd, versionCmd } from './cmd'
import { isUserInfoResult, isUserMessageEvent, isValidTuple } from './utils'

export const registerEventHandlers = (
  rtm: RTMClient,
  web: WebClient,
  log: pino.Logger,
  channel: string
): void => {
  let me: models.Self // 許せ
  const msgBase = Object.freeze({
    channel,
    as_user: true,
    link_names: true,
  })

  rtm.on(
    EventKind.Authenticated,
    (ev: models.ConnectedEvent): void => {
      const _log = log.child({ event: EventKind.Authenticated })
      me = ev.self
      Object.freeze(me)
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
            results: [WebAPICallResult, WebAPICallResult]
          ): Promise<WebAPICallResult> => {
            if (isValidTuple(results)) {
              const [channel, user] = results
              const msg: ChatPostMessageArguments = Object.assign(
                {
                  text: `:skull: channel(#${
                    channel.channel.name
                  }) has been archived by @${user.user.name}`,
                },
                msgBase
              )
              return web.chat.postMessage(msg)
            } else if (results[0].ok) {
              return Promise.reject(`Cannot find user: ${ev.user}`)
            } else if (results[1].ok) {
              return Promise.reject(`Cannot find channel: ${ev.channel}`)
            } else {
              return Promise.reject(
                `Cannot find user: ${ev.user} and channel: ${ev.channel}`
              )
            }
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
          (user: WebAPICallResult): Promise<WebAPICallResult> => {
            if (isUserInfoResult(user)) {
              const msg: ChatPostMessageArguments = Object.assign(
                {
                  text: `:baby: channel created. #${ev.channel.name} by @${
                    user.user.name
                  }`,
                },
                msgBase
              )
              return web.chat.postMessage(msg)
            } else {
              return Promise.reject(`Cannot find user: ${ev.channel.creator}`)
            }
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
            results: [WebAPICallResult, WebAPICallResult]
          ): Promise<WebAPICallResult> => {
            if (isValidTuple(results)) {
              const [channel, user] = results
              const msg: ChatPostMessageArguments = Object.assign(
                {
                  text: `:zombie: channel(#${
                    channel.channel.name
                  }) has been unarchived by @${user.user.name}`,
                },
                msgBase
              )
              return web.chat.postMessage(msg)
            } else if (results[0].ok) {
              return Promise.reject(`Cannot find user: ${ev.user}`)
            } else if (results[1].ok) {
              return Promise.reject(`Cannot find channel: ${ev.channel}`)
            } else {
              return Promise.reject(
                `Cannot find user: ${ev.user} and channel: ${ev.channel}`
              )
            }
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

      if (isUserMessageEvent(ev)) {
        if (typeof ev.text !== 'string') {
          console.error(`type of ev.text is ${typeof ev.text}`)
          return
        }
        const strs = ev.text
          .replace(/\.$/, '')
          .replace(/ +/g, ' ') // よくある事故の防止
          .split(' ')

        // handle reminder
        if (strs[0] === 'Reminder:') {
          strs.shift()
        } else if (strs[0] === 'リマインダー' && strs[1] === ':') {
          strs.shift()
          strs.shift()
        }

        // trigger command
        if (strs[0] === '$') {
          strs.shift()
        } else {
          _log.info('not cmd message')
          return
        }

        // handle invalid message
        if (strs.length === 0) {
          return
        }

        _log.info({ parsed: strs, cmd: strs[0], args: strs.slice(1) })
        ;(async (args: string[]): Promise<ChatPostMessageArguments> => {
          switch (args.shift()) {
            case 'ojichat': {
              return ojichatCmd(args, web, ev, me)
            }
            case 'version': {
              return versionCmd(ev)
            }
            default: {
              return helpCmd(ev)
            }
          }
        })(strs)
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
      } else {
        return
      }
    }
  )
}
