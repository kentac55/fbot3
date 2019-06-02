import { WebAPICallResult } from '@slack/client'

type Attachment = {
  text: string
  id: number
  fallback: string
}

type Latest = {
  text: string
  username: string
  bot_id: string
  attachments: Attachment[]
  type: string
  subtype: string
  ts: string
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
  latest: Latest
  unread_count: number
  unread_count_display: number
  members: string[]
  topic: Topic
  purpose: Purpose
  previous_names: string[]
}

export type ChannelInfoResult = WebAPICallResult & {
  ok: boolean
  channel: Channel
}

type Message = {
  text: string
  username: string
  bot_id: string
  attachments: Attachment[]
  type: string
  subtype: string
  ts: string
}

export type ChatPostMessageResult = WebAPICallResult & {
  ok: boolean
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
  ok: boolean
  user: User
}
