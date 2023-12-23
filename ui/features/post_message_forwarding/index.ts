// @ts-nocheck
/*
 * Copyright (C) 2022 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import ready from '@instructure/ready'
import {EnvPlatformStoragePostMessageForwarding} from '@canvas/global/env/EnvPlatformStorage'

type Message = {
  sourceToolInfo?: {
    origin: string
    windowId: number
  }
  [key: string]: any
}

type WindowReferences = [Window]

export const handler =
  (
    parentOrigin: string,
    windowReferences: WindowReferences,
    parentWindow: Window | null,
    includeRCESignal: false
  ) =>
  (e: MessageEvent) => {
    let message: Message
    try {
      message = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
    } catch (err) {
      // unparseable message may not be meant for our handlers
      return false
    }

    if (e.origin === parentOrigin) {
      // message from canvas -> tool
      const {sourceToolInfo, ...messageWithoutSourceToolInfo} = message
      if (!sourceToolInfo) {
        return false
      }
      const targetOrigin = sourceToolInfo?.origin
      const targetWindow = windowReferences[sourceToolInfo?.windowId]
      targetWindow?.postMessage(messageWithoutSourceToolInfo, targetOrigin)
    } else {
      // message from tool -> canvas
      // We can't forward the whole `e.source` window in the postMessage,
      // so we keep a list (`windowReferences`) of all windows we've received
      // messages from, and include the index into that list as `windowId`
      let windowId = windowReferences.indexOf(e.source)
      if (windowId === -1) {
        windowReferences.push(e.source)
        windowId = windowReferences.length - 1
      }
      const newMessage = {...message, sourceToolInfo: {origin: e.origin, windowId}}
      if (includeRCESignal) {
        newMessage.in_rce = true
      }
      parentWindow?.postMessage(newMessage, parentOrigin)
    }
  }

ready(() => {
  const {PARENT_ORIGIN, IN_RCE} = window.ENV as EnvPlatformStoragePostMessageForwarding
  const windowReferences = [] as WindowReferences

  if (IN_RCE) {
    // Canvas renders the RCE/TinyMCE, which uses an iframe to enclose the content being edited
    // tools inside the editor should send _all_ postMessages directly to Canvas
    const canvasWindow = window.parent.parent
    window.addEventListener('message', handler(window.origin, windowReferences, canvasWindow, true))
  } else {
    window.addEventListener('message', handler(PARENT_ORIGIN, windowReferences, window.top))
  }
})
