export const enum EventKind {
  Authenticated = 'authenticated',
  BotAdded = 'bot_added',
  BotChanged = 'bot_changed',
  ChannelArchive = 'channel_archive',
  ChannelCreated = 'channel_created',
  ChannelDeleted = 'channel_deleted',
  ChannelHistoryChanged = 'channel_history_changed',
  ChannelJoined = 'channel_joined',
  ChannelLeft = 'channel_left',
  ChannelMarked = 'channel_marked',
  ChannelRename = 'channel_rename',
  ChannelUnarchive = 'channel_unarchive',
  CommandsChanged = 'CommandsChanged',
  DndUpdated = 'dnd_updated',
  DndUpdatedUser = 'dnd_updated_user',
  EmailDomainChanged = 'email_domain_changed',
  EmojiChanged = 'emoji_changed',
  FileChange = 'file_change',
  FileCommentAdded = 'file_comment_added',
  FileCommentDeleted = 'file_comment_deleted',
  FileCommentEdited = 'file_comment_edited',
  FileCreated = 'file_created',
  FileDeleted = 'file_deleted',
  FilePublic = 'file_public',
  FileShared = 'file_shared',
  FileUnshared = 'file_unshared',
  Goodbye = 'goodbye',
  GroupArchive = 'group_archive',
  GroupClose = 'group_close',
  GroupDeleted = 'group_deleted',
  GroupHistoryChanged = 'group_history_changed',
  GroupJoind = 'group_joind',
  GroupLeft = 'group_left',
  GroupMarked = 'group_marked',
  GroupOpen = 'group_open',
  GroupUnarchive = 'group_unarchive',
  Hello = 'hello',
  ImClose = 'im_close',
  ImHistoryChanged = 'im_history_changed',
  ImMarked = 'im_marked',
  ImOpen = 'im_open',
  ManualPresenceChange = 'manual_presence_change',
  MemberJoinedChannel = 'member_joined_channel',
  MemberLeftChannel = 'member_left_channel',
  Message = 'message',
  PinAdded = 'pin_added',
  PinRemoved = 'pin_removed',
  PrefChange = 'pref_chnage',
  PresenceChange = 'presence_change',
  PresenceQuery = 'presence_query',
  PresenceSub = 'presence_sub',
  ReactionAdded = 'reaction_added',
  ReactionRemoved = 'reaction_removed',
  ReconnectUrl = 'reconnect_url',
  StarAdded = 'star_added',
  StarRemoved = 'star_removed',
  SubteamCreated = 'subteam_created',
  SubteamMembersChanged = 'subteam_members_changed',
  SubteamSelfAdded = 'subteam_self_added',
  SubteamSelfRemoved = 'subteam_self_removed',
  SubteamUpdated = 'subteam_updated',
  TeamDomainChange = 'team_domain_change',
  TeamJoin = 'team_join',
  TeamMigrationStarted = 'team_migration_started',
  TeamPlanChange = 'team_plan_change',
  TeamPrefChange = 'team_pref_change',
  TeamProfileChange = 'team_profile_change',
  TeamProfileDelete = 'team_profile_delete',
  TeamProfileReorder = 'team_profile_reorder',
  TeamRename = 'team_rename',
  UserChange = 'user_change',
  UserTyping = 'user_typing',
}

export const enum ReponseErrors {
  NotAuthed = 'not_authed',
  InvalidAuth = 'invalid_auth',
  AccountInactive = 'account_inactive',
  TokenRevoked = 'token_revoked',
  NoPermission = 'no_permission',
  OrgLoginRequired = 'org_login_required',
  InvalidArgName = 'invalid_arg_name',
  InvalidArrayArg = 'invalid_array_arg',
  InvalidCharset = 'invalid_charset',
  InvalidFormData = 'invalid_form_data',
  InvalidPostType = 'invalid_post_type',
  MissingPostType = 'missing_post_type',
  TeamAddedToOrg = 'team_added_to_org',
  RequestTimeout = 'request_timeout',
  FatalError = 'fatal_error',
}

export const enum EmojiEventKind {
  Add = 'add',
  Remove = 'remove',
}

export const enum ItemKind {
  Message = 'message',
  File = 'file',
  FileComment = 'file_comment',
}

export const enum MessageSubEventKind {}
