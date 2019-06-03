import { RTMClient, WebClient } from '@slack/client'
import { CronJob } from 'cron'

import { getTokenFromEnv, getClients, getChannel } from './utils'
import pino from 'pino'
import { registerEventHandlers } from './slack/index'

const logger = pino()
const [rtm, web]: [RTMClient, WebClient] = getClients(getTokenFromEnv())
const channel = getChannel()

rtm.start()

registerEventHandlers(rtm, web, logger.child({ module: 'slack' }), channel)

const job = new CronJob(
  // At 09:00 on every day-of-week from Monday through Friday.
  '00 00 00 * * 1-5',
  (): void => {
    web.chat.postMessage({
      channel,
      text: '$ help',
      as_user: true,
      link_names: true,
    })
  }
)

job.start()
