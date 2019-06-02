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

export const registerEventHandlers = (
  rtm: RTMClient,
  web: WebClient,
  log: pino.Logger,
  channel: string
): void => {
  const msgBase = {
    channel,
    as_user: true,
    link_names: true,
  }
  rtm.on(
    EventKind.Authenticated,
    (ev: models.ConnectedEvent): void => {
      const _log = log.child({ event: EventKind.Authenticated })
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
      ]).then(
        (tupled: [WebAPICallResult, WebAPICallResult]): void => {
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
            web.chat.postMessage(msg)
            _log.info(msg)
          } else if (channel) {
            _log.error(`Cannot find user: ${ev.user}`)
          } else if (user) {
            _log.error(`Cannot find channel: ${ev.channel}`)
          } else {
            _log.error(`Cannot find user: ${ev.user}`)
            _log.error(`Cannot find channel: ${ev.channel}`)
          }
        }
      )
    }
  )
}
