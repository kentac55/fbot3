import {
  ChatPostMessageArguments,
  MessageAttachment,
  RTMClient,
  WebAPICallResult,
  WebClient,
} from '@slack/client'
import pino from 'pino'

import { EventKind, EmojiEventKind, FileType } from './kinds'
import * as models from './models'
import { ojichatCmd, reactionListCmd, helpCmd, versionCmd } from './cmd'
import {
  ValidCommand,
  getVersion,
  isChannelInfoResult,
  isFileInfoResult,
  isUserInfoResult,
  isUserMessageEvent,
  isValidTuple,
  parse,
  sleep,
} from './utils'

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
      getVersion()
        .then(
          (data): Promise<WebAPICallResult> => {
            const msg: ChatPostMessageArguments = Object.assign(
              {
                text: `:information_source: ${ev.self.name}(version ${data})`,
              },
              msgBase
            )
            return web.chat.postMessage(msg)
          }
        )
        .catch(
          (e): void => {
            _log.error(e)
            const msg: ChatPostMessageArguments = Object.assign(
              {
                text: `:information_source: ${
                  ev.self.name
                }(status: :thinking_face:)`,
              },
              msgBase
            )
            web.chat.postMessage(msg)
          }
        )
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
          text: `:writing_hand: a channel has been renamed to #${
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

      if (!isUserMessageEvent(ev)) {
        return
      }

      if (typeof ev.text !== 'string') {
        console.error(`type of ev.text is ${typeof ev.text}`)
        return
      }

      const cmd = parse(ev.text)

      _log.info(cmd)

      async function* execute(
        cmd: ValidCommand,
        ev: models.UserMessageEvent
      ): AsyncIterableIterator<WebAPICallResult> {
        let i = 0 // 許せ
        while (i < cmd.runs) {
          i++
          const msg = await (async (
            args: string[]
          ): Promise<ChatPostMessageArguments> => {
            switch (cmd.cmd) {
              case 'ojichat': {
                return ojichatCmd(args, web, ev, me)
              }
              case 'reaction': {
                return reactionListCmd(args, web, ev)
              }
              case 'version': {
                return versionCmd(ev)
              }
              default: {
                return helpCmd(ev)
              }
            }
          })(cmd.args)
          yield web.chat.postMessage(msg)
          await sleep(1000)
        }
      }

      if (cmd.isCmd) {
        ;(async (
          cmd: ValidCommand,
          ev: models.UserMessageEvent
        ): Promise<void> => {
          for await (const result of execute(cmd, ev)) {
            _log.info(result)
          }
        })(cmd, ev).catch(
          (e: Error): void => {
            _log.error(e)
          }
        )
      }
    }
  )

  rtm.on(
    EventKind.MemberJoinedChannel,
    (ev: models.MemberJoinedChannelEvent): void => {
      const _log = log.child({ event: EventKind.MemberJoinedChannel })
      web.users
        .info({ user: ev.user })
        .then(
          (user: WebAPICallResult): Promise<WebAPICallResult> => {
            if (isUserInfoResult(user)) {
              const msg: ChatPostMessageArguments = {
                text: `:+1: Welcome @${user.user.name}`,
                channel: ev.channel,
                as_user: true,
                link_names: true,
              }
              return web.chat.postMessage(msg)
            } else {
              return Promise.reject(`Cannot find user: ${ev.user}`)
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
    EventKind.MemberLeftChannel,
    (ev: models.MemberLeftChannelEvent): void => {
      const _log = log.child({ event: EventKind.MemberLeftChannel })
      web.channels
        .info({ channel: ev.channel })
        .then(
          (channel): Promise<[WebAPICallResult, WebAPICallResult]> => {
            if (isChannelInfoResult(channel)) {
              return Promise.all([
                web.users.info({ user: channel.channel.creator }),
                web.users.info({ user: ev.user }),
              ])
            } else {
              return Promise.reject(`Cannot find channel: ${ev.channel}`)
            }
          }
        )
        .then(
          (results): Promise<WebAPICallResult> => {
            if (isUserInfoResult(results[0]) && isUserInfoResult(results[1])) {
              const [creator, target] = results
              const msg: ChatPostMessageArguments = {
                text: `:loudspeaker: @${creator.user.name} 抜け忍を検知 => @${
                  target.user.name
                }`,
                channel: ev.channel,
                as_user: true,
                link_names: true,
              }
              return web.chat.postMessage(msg)
            } else {
              return Promise.reject(`Cannot find user: ${ev.user}`)
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
    EventKind.FileCreated,
    (ev: models.FileCreated): void => {
      const _log = log.child({ event: EventKind.FileCreated })
      const blackList = [FileType.Xls]
      web.files
        .info({ file: ev.file_id })
        .then(
          (file: WebAPICallResult): Promise<WebAPICallResult> => {
            if (
              isFileInfoResult(file) &&
              blackList.some((v): boolean => v === file.file.filetype)
            ) {
              const msg: ChatPostMessageArguments = Object.assign(
                {
                  text: `:warning: ${file.file.permalink}`,
                },
                msgBase
              )
              return web.chat.postMessage(msg)
            } else {
              return Promise.reject(`not match`)
            }
          }
        )
        .then(
          (res): void => {
            _log.info(res)
          }
        )
        .catch(
          (e): void => {
            _log.error(e)
          }
        )
    }
  )
}
