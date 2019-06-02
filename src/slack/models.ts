import { EventKind, EmojiEventKind, ItemKind } from './kinds'

export type Event = {
  type: EventKind
}

export type EventWithSubType = Event & {
  subtype: string
}

type Channel = {
  id: string
  name: string
  created: number
}

export type ChannelWithCreator = Channel & {
  creator: string
}

export type ChannelArchiveEvent = Event & {
  type: EventKind.ChannelArchive
  channel: string
  user: string
}

export type ChannelCreatedEvent = Event & {
  type: EventKind.ChannelCreated
  channel: ChannelWithCreator
}

export type ChannelDeleted = Event & {
  type: EventKind.ChannelDeleted
  channel: string
}

export type ChannelHistoryChangedEvent = Event & {
  type: EventKind.ChannelHistoryChanged
  latest: string
  ts: string
  event_ts: string
}

export type ChannelJoindEvent = Event & {
  type: EventKind.ChannelJoined
  channel: ChannelWithCreator
}

export type ChannelLeftEvent = Event & {
  type: EventKind.ChannelLeft
  channel: string
}

export type ChannelMarkedEvent = Event & {
  type: EventKind.ChannelMarked
  channel: string
  ts: string
}

export type ChannelRenameEvent = Event & {
  type: EventKind.ChannelRename
  channel: Channel
}

export type ChannelUnarchiveEvent = Event & {
  type: EventKind.ChannelUnarchive
  channel: string
  user: string
}

export type ConnectedEvent = {
  ok: boolean
  self: Self
  team: Team
  url: string
}

type Self = {
  id: string
  name: string
}

type Team = {
  domain: string
  id: string
  name: string
}

type EmojiEventCommon = EventWithSubType & {
  type: EventKind.EmojiChanged
  subtype: EmojiEventKind
  event_ts: string
}

export type EmojiAddEvent = EmojiEventCommon & {
  subtype: EmojiEventKind.Add
  name: string
  value: string
}

export type EmojiRemoveEvent = EmojiEventCommon & {
  subtype: EmojiEventKind.Remove
  names: string[]
}

export type EmojiEvent = EmojiAddEvent | EmojiRemoveEvent

export type MemberJoinedChannelEvent = Event & {
  type: EventKind.MemberJoinedChannel
  user: string
  channel: string
  channel_type: string
  team: string
  inviter?: string
}

export type MemberLeftChannelEvent = Event & {
  type: EventKind.MemberLeftChannel
  user: string
  channel: string
  channel_type: string
  team: string
}

type Item = {
  type: ItemKind
  channel: string
  ts: string
}

type ReactionEvent = Event & {
  type: EventKind.ReactionAdded | EventKind.ReactionRemoved
  user: string
  reaction: string
  item_user: string
  item: Item
  event_ts: string
}

export type ReactionAddedEvent = ReactionEvent & {
  type: EventKind.ReactionAdded
}

export type ReactionRemovedEvent = Event & {
  type: EventKind.ReactionRemoved
}
