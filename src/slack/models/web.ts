import { WebAPICallResult } from '@slack/client'

import { EventKind, ItemKind, FileMode, FileType } from '../kinds'

type Attachment = {
  text: string
  id: number
  fallback: string
}

type Topic = {
  value: string
  creator: string
  last_set: number
}

type Purpose = {
  value: string
  creator: string
  last_set: number
}

type Channel = {
  id: string
  name: string
  is_channel: boolean
  created: number
  creator: string
  is_archived: boolean
  is_general: boolean
  name_normalized: string
  is_shared: boolean
  is_org_shared: boolean
  is_member: boolean
  is_private: boolean
  is_mpim: boolean
  last_read: string
  latest: Message
  unread_count: number
  unread_count_display: number
  members: string[]
  topic: Topic
  purpose: Purpose
  previous_names: string[]
}

export type ChannelInfoResult = WebAPICallResult & {
  ok: true
  channel: Channel
}

type Message = {
  // 固定
  type: EventKind.Message
  channel: string
  text: string
  ts: string

  // 変動
  // TODO: use Kind
  subtype?: string
  attachments?: Attachment[]
  bot_id?: string
  deleted_ts?: string
  event_ts?: string
  hidden?: boolean
  is_starred?: boolean
  pinned_to?: string[]
  reactions?: Reaction[]
  user?: string // if (!bot_id)
  username?: string // if (bot_id)
}

export type ChatPostMessageResult = WebAPICallResult & {
  ok: true
  channel: string
  ts: string
  message: Message
}

type Profile = {
  avatar_hash: string
  status_text: string
  status_emoji: string
  real_name: string
  display_name: string
  real_name_normalized: string
  display_name_normalized: string
  email: string
  image_original: string
  image_24: string
  image_32: string
  image_48: string
  image_72: string
  image_192: string
  image_512: string
  team: string
}

type User = {
  id: string
  team_id: string
  name: string
  deleted: boolean
  color: string
  real_name: string
  tz: string
  tz_label: string
  tz_offset: number
  profile: Profile
  is_admin: boolean
  is_owner: boolean
  is_primary_owner: boolean
  is_restricted: boolean
  is_ultra_restricted: boolean
  is_bot: boolean
  updated: number
  is_app_user: boolean
  has_2fa: boolean
}

export type UserInfoResult = WebAPICallResult & {
  ok: true
  user: User
}

export type ReactionListResult = WebAPICallResult & {
  ok: true
  items: ReacttionListItem[]
  response_metadata: ResponseMetadata
}

export type ReacttionListItem =
  | ReactionItemFile
  | ReactionItemFileComment
  | ReactionItemMessage

export type ReactionItemFile = {
  file: File
  type: ItemKind.File
}

export type ReactionItemFileComment = {
  comment: FileComment
  file: File
}

export type ReactionItemMessage = {
  type: ItemKind.Message
  channel: string
  message: Message
}

type FileComment = {
  type: string
  comment: string
  created: number
  id: string
  reactions: Reaction[]
  timestamp: number
  user: string
}

type File = {
  id: string
  created: number
  timestamp: number

  // name may null if the file has no name
  name: string | null
  title: string
  mimetype: string
  filetype: FileType
  pretty_type: string
  user: string
  editable: boolean
  size: number
  mode: FileMode
  is_external: boolean
  external_type: string
  is_public: boolean
  public_url_shared: boolean
  display_as_bot: boolean
  username: string
  url_private: string
  url_private_download: string

  // not all file
  thumb_64?: string
  thumb_80?: string
  thumb_360?: string
  thumb_360_w?: number
  thumb_360_h?: number
  thumb_160?: string
  thumb_360_gif?: string
  thumb_480?: string
  thumb_720?: string
  thumb_960?: string
  thumb_1024?: string

  // only image files
  image_exif_rotation?: number
  original_w?: number
  original_h?: number
  deanimate_gif?: string
  pjpeg?: string

  permalink: string
  permalink_public: string

  // appear if mode is snippet or post
  edit_link?: string

  // Previews
  preview?: string
  preview_highlight?: string
  lines?: string
  lines_more?: string

  comments_count: number
  is_starred: boolean

  // appear if someone have sttard
  num_stars?: number

  shares: Shares
  channels: string[]
  groups: string[]
  ims: string[]
  has_rich_preview: boolean

  pinned_to?: string[] // channelID

  reactions?: Reaction[]

  initial_comment?: string
}

type Shares = {
  public: Public
}

type Public = {
  [key: string]: SharedInChannel[]
}

type SharedInChannel = {
  reply_users: string[]
  reply_users_count: number
  reply_count: number
  ts: string
  thread_ts: string
  latest_reply: string
  channel_name: string
  team_id: string
}

type Reaction = {
  name: string
  count: number
  users: string[]
}

type ResponseMetadata = {
  next_cursor: string
}
