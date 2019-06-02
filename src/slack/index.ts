import {
  RTMClient,
  WebClient,
  ChatPostMessageArguments,
  MessageAttachment,
} from '@slack/client'
import pino from 'pino'
import { EventKind, EmojiEventKind } from './kinds'
import { ConnectedEvent, EmojiEvent } from './models'

export const registerEventHandlers = (
  rtm: RTMClient,
  web: WebClient,
  log: pino.Logger,
  channel: string
): void => {
  rtm.on(
    EventKind.Authenticated,
    (ev: ConnectedEvent): void => {
      const _log = log.child({ event: EventKind.Authenticated })
      _log.info(ev)
    }
  )
  rtm.on(
    EventKind.EmojiChanged,
    (ev: EmojiEvent): void => {
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
        const message: ChatPostMessageArguments = {
          channel: channel,
          text: `:${ev.name}:`,
          attachments: [attachment],
          as_user: true,
        }
        web.chat.postMessage(message)
        _log.info(message)
      } else if (ev.subtype === EmojiEventKind.Remove) {
        ev.names.forEach(
          (name: string): void => {
            const message: ChatPostMessageArguments = {
              channel: channel,
              text: `:${name}: has been removed`,
              as_user: true,
            }
            web.chat.postMessage(message)
            log.info(message)
          }
        )
      } else {
        const _: never = ev
        new Error(_)
      }
    }
  )
}
