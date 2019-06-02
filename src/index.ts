import { RTMClient, WebClient } from '@slack/client'

import { getTokenFromEnv, getClients, getChannel } from './utils'
import pino from 'pino'
import { registerEventHandlers } from './slack/index'

const logger = pino()
const [rtm, web]: [RTMClient, WebClient] = getClients(getTokenFromEnv())

rtm.start()

registerEventHandlers(rtm, web, logger.child({ module: 'slack' }), getChannel())
