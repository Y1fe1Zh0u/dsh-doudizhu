/** Typed failures returned by LAN room commands. */

import type { LanRoomErrorCode } from './types.ts'

/** Command rejection with a stable code and actionable message. */
export class LanRoomError extends Error {
  /** Stable machine-readable failure code. */
  readonly code: LanRoomErrorCode

  /** Create one room command rejection. */
  constructor(message: string, code: LanRoomErrorCode) {
    super(message)
    this.name = 'LanRoomError'
    this.code = code
  }
}
