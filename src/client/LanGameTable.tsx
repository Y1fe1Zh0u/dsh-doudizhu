/** Full conversation-view card table with lobby controls. */

import { useEffect, useState, type CSSProperties } from 'react'
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { LanRoomPublicMember, LanRoomParticipantView } from '../transport/client.ts'
import type { DoudizhuCardId, DoudizhuPublicView, DoudizhuSeat } from '../doudizhu/client.ts'
import type { DoudizhuDecisionOutcome } from '../doudizhu-runtime/client.ts'
import type { LanGameClient, LanGameClientState } from './controller.ts'
import { doudizhuPrivateSnapshot, doudizhuTableSnapshot } from './game-view.ts'
import { KENNEY_CARD_BACK, KENNEY_CARD_IMAGES } from './card-assets.generated.ts'
import type { LanGameKey } from './locales.ts'
import { historyEntryKey, useTableMotion, type TableMotionEvent } from './table-motion.ts'
import css from './LanGameTable.module.css'

/** Session-bound controller passed by the slot registration. */
export interface LanGameTableInjected {
  readonly hooks: { readonly lanGame: LanGameClient['store'] }
  readonly start: () => () => void
  readonly host: (strategyPrompt: string) => Promise<void>
  readonly join: (request: { url: string; code: string; strategyPrompt: string }) => Promise<void>
  readonly updatePrompt: (strategyPrompt: string) => Promise<void>
  readonly setReady: (ready: boolean) => Promise<void>
  readonly leave: () => Promise<void>
}

type Props = ConvViewProps & InjectFace<LanGameTableInjected> & PropsLocale<'lanGame'>

const DEFAULT_PROMPT = '稳健出牌，优先保留炸弹，并根据已经出现的牌推断剩余牌型。'

/** Render setup, lobby, and autonomous-game states without replacing the resident composer. */
export function LanGameTable({
  useLanGame, start, host, join, updatePrompt, setReady, leave, t,
}: Props) {
  const state = useLanGame(value => value)
  const [strategyPrompt, setStrategyPrompt] = useState(DEFAULT_PROMPT)
  const [url, setUrl] = useState('')
  const [code, setCode] = useState('')

  useEffect(start, [start])
  const savedPrompt = state.participant?.strategyPrompt
  useEffect(() => {
    if (savedPrompt !== undefined) setStrategyPrompt(savedPrompt)
  }, [savedPrompt])

  if (state.status === 'loading') return <div className={css.loading}>{t('state.loading')}</div>
  if (state.status === 'idle' || state.participant === undefined) {
    return (
      <main className={css.setup} data-lan-game-table="setup">
        <section className={css.setupCard}>
          <div className={css.eyebrow}>DSH · LAN AGENT GAME</div>
          <h2>{t('setup.title')}</h2>
          <p>{t('setup.subtitle')}</p>
          <label className={css.field}>
            <span>{t('prompt.label')}</span>
            <textarea
              value={strategyPrompt}
              onChange={(event) => { setStrategyPrompt(event.target.value) }}
              placeholder={t('prompt.placeholder')}
            />
          </label>
          <button className={css.primaryButton} type="button" disabled={state.pending || strategyPrompt.trim() === ''} onClick={() => { void host(strategyPrompt) }}>
            {t('host.action')}
          </button>
          <div className={css.divider}><span>或</span></div>
          <div className={css.joinGrid}>
            <label className={css.field}>
              <span>{t('join.url')}</span>
              <input
                value={url}
                onChange={(event) => { setUrl(event.target.value) }}
                placeholder="ws://192.168.1.8:43120/"
              />
            </label>
            <label className={css.field}>
              <span>{t('join.code')}</span>
              <input
                value={code}
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => { setCode(event.target.value.replace(/\D/gu, '')) }}
                placeholder="123456"
              />
            </label>
          </div>
          <button className={css.secondaryButton} type="button" disabled={state.pending || strategyPrompt.trim() === '' || url.trim() === '' || code.length !== 6} onClick={() => { void join({ url, code, strategyPrompt }) }}>
            {t('join.action')}
          </button>
          {state.error !== undefined && <p className={css.error} role="alert">{state.error}</p>}
        </section>
      </main>
    )
  }
  return (
    <RoomTable
      state={state}
      participant={state.participant}
      strategyPrompt={strategyPrompt}
      setStrategyPrompt={setStrategyPrompt}
      updatePrompt={updatePrompt}
      setReady={setReady}
      leave={leave}
      t={t}
    />
  )
}

interface RoomProps {
  readonly state: LanGameClientState
  readonly participant: LanRoomParticipantView
  readonly strategyPrompt: string
  readonly setStrategyPrompt: (value: string) => void
  readonly updatePrompt: (value: string) => Promise<void>
  readonly setReady: (ready: boolean) => Promise<void>
  readonly leave: () => Promise<void>
  readonly t: (key: LanGameKey) => string
}

function RoomTable({ state, participant, strategyPrompt, setStrategyPrompt, updatePrompt, setReady, leave, t }: RoomProps) {
  const { room } = participant
  const me = room.members.find(member => member.id === participant.memberId)
  const seats = Array.from({ length: room.maxMembers }, (_, seat) => room.members.find(member => member.seat === seat))
  const game = doudizhuTableSnapshot(participant.game)
  const privateGame = doudizhuPrivateSnapshot(participant.privateGame)
  const publicGame = game?.status === 'failed' ? undefined : game?.state
  const activeSeat = game?.status === 'failed' ? undefined : game?.decisionSeat ?? publicGame?.currentSeat
  const decisionOutcomes = game?.status === 'failed' ? undefined : game?.decisionOutcomes
  const localSeat = (me?.seat ?? 0) as DoudizhuSeat
  const leftSeat = ((localSeat + 1) % 3) as DoudizhuSeat
  const rightSeat = ((localSeat + 2) % 3) as DoudizhuSeat
  const editable = room.phase === 'lobby' && !me?.ready
  const motion = useTableMotion(game, room.phase)
  const displayedLastPlay = motion.hideLastPlay ? undefined : publicGame?.lastPlay
  return (
    <main className={css.room} data-lan-game-table={room.phase}>
      <header className={css.roomHeader}>
        <div>
          <span className={css.eyebrow}>DSH · AUTONOMOUS TABLE</span>
          <strong>{phaseLabel(room.phase, t)}</strong>
        </div>
        <div className={css.roomCode}><span>{t('room.code')}</span><b>{room.code}</b></div>
      </header>
      <section className={css.table} aria-label={t('setup.title')}>
        <Seat
          member={seats[leftSeat]}
          me={participant.memberId}
          position="left"
          count={publicGame?.cardCounts[leftSeat]}
          landlord={publicGame?.landlord === leftSeat}
          active={activeSeat === leftSeat}
          t={t}
        />
        <Seat
          member={seats[rightSeat]}
          me={participant.memberId}
          position="right"
          count={publicGame?.cardCounts[rightSeat]}
          landlord={publicGame?.landlord === rightSeat}
          active={activeSeat === rightSeat}
          t={t}
        />
        <div className={css.tableHud}>
          <span>DSH</span>
          <b>斗地主</b>
          <small>{gameStatus(room.phase, game, t)}</small>
          {game !== undefined && game.status !== 'failed' && (
            <span className={css.matchRound}>
              {t('game.round')
                .replace('{round}', String(game.round))
                .replace('{total}', String(game.totalRounds))}
            </span>
          )}
          {publicGame !== undefined && <em>{t('game.multiplier').replace('{value}', String(publicGame.multiplier))}</em>}
          {game !== undefined && game.status !== 'failed' && (
            <span className={css.totalScore}>
              {t('game.totalScore')
                .replace('{a}', String(game.totalScores[0]))
                .replace('{b}', String(game.totalScores[1]))
                .replace('{c}', String(game.totalScores[2]))}
            </span>
          )}
        </div>
        {publicGame !== undefined && publicGame.bottom.length > 0 && (
          <div className={css.bottomCards}>
            <CardRow label={t('game.bottom')} cards={publicGame.bottom} compact />
          </div>
        )}
        {publicGame !== undefined && (displayedLastPlay !== undefined || publicGame.history.length > 0) && (
          <div className={css.playRail} data-lan-game-play-rail>
            {displayedLastPlay !== undefined && <CardRow label={t('game.lastPlay')} cards={displayedLastPlay.combination.cards} />}
            <RecentActions history={publicGame.history} outcomes={decisionOutcomes} t={t} />
          </div>
        )}
        <div className={css.localPlayerArea}>
          <Seat
            member={seats[localSeat]}
            me={participant.memberId}
            position="bottom"
            count={publicGame?.cardCounts[localSeat]}
            landlord={publicGame?.landlord === localSeat}
            active={activeSeat === localSeat}
            t={t}
          />
          {privateGame !== undefined && privateGame.yourCards.length > 0 && (
            <div className={css.hand} aria-label={t('game.yourCards')}>
              <CardRow label={t('game.yourCards')} cards={privateGame.yourCards} />
            </div>
          )}
        </div>
        {motion.finalSettlement !== undefined && (
          <TableMotionLayer event={motion.finalSettlement} localSeat={localSeat} t={t} />
        )}
        {motion.finalSettlement === undefined && !motion.reducedMotion && motion.event !== undefined && (
          <TableMotionLayer event={motion.event} localSeat={localSeat} t={t} />
        )}
      </section>
      <aside className={css.controlPanel}>
        {participant.role === 'coordinator' && room.phase === 'lobby' && (
          <div className={css.share}>
            <span>{t('room.copyHint')}</span>
            {participant.joinUrls.map(joinUrl => <code key={joinUrl}>{joinUrl}</code>)}
          </div>
        )}
        {room.phase === 'lobby' ? (
          <label className={css.field}>
            <span>{t('prompt.label')}</span>
            <textarea
              value={strategyPrompt}
              disabled={!editable || state.pending}
              onChange={(event) => { setStrategyPrompt(event.target.value) }}
            />
          </label>
        ) : (
          <details className={css.lockedStrategy}>
            <summary>{t('prompt.locked')}</summary>
            <p>{strategyPrompt}</p>
          </details>
        )}
        <div className={css.actions}>
          {editable && <button className={css.secondaryButton} type="button" disabled={state.pending || strategyPrompt.trim() === ''} onClick={() => { void updatePrompt(strategyPrompt) }}>{t('room.savePrompt')}</button>}
          {room.phase === 'lobby' && <button className={css.primaryButton} type="button" disabled={state.pending} onClick={() => { void setReady(!me?.ready) }}>{me?.ready ? t('room.cancelReady') : t('room.ready')}</button>}
          {room.phase === 'lobby' && <button className={css.ghostButton} type="button" disabled={state.pending} onClick={() => { void leave() }}>{t('room.leave')}</button>}
          {room.phase === 'finished' && <button className={css.primaryButton} type="button" disabled={state.pending} onClick={() => { void leave() }}>{t('room.newRoom')}</button>}
        </div>
        {state.error !== undefined && <p className={css.error} role="alert">{state.error}</p>}
      </aside>
    </main>
  )
}

interface SeatProps {
  readonly member: LanRoomPublicMember | undefined
  readonly me: string
  readonly position: 'left' | 'right' | 'bottom'
  readonly count: number | undefined
  readonly landlord: boolean
  readonly active: boolean
  readonly t: (key: LanGameKey) => string
}

function Seat({ member, me, position, count, landlord, active, t }: SeatProps) {
  const connected = member?.connected ?? false
  return (
    <div
      className={`${css.seat} ${css[position]} ${active && connected ? css.activeSeat : ''} ${member !== undefined && !connected ? css.offlineSeat : ''}`}
      data-connected={member === undefined ? undefined : connected}
    >
      <div className={css.avatar}>{member === undefined ? '?' : member.seat + 1}</div>
      <div className={css.seatCopy} data-connected={member === undefined ? undefined : connected}>
        <strong>{member === undefined ? t('seat.empty') : member.id === me ? t('seat.you') : compactId(member.id)}</strong>
        {member !== undefined && (
          <small>
            {!member.connected
              ? t('seat.offline')
              : landlord
                ? t('game.landlord')
                : count === undefined
                  ? member.ready ? t('seat.ready') : t('seat.notReady')
                  : t('game.cardsLeft').replace('{count}', String(count))}
          </small>
        )}
        {active && <span className={css.turnBadge}>{t('game.turn')}</span>}
      </div>
      {member !== undefined && (
        <div className={css.cardFan} aria-hidden="true">
          <img src={KENNEY_CARD_BACK} alt="" />
          <img src={KENNEY_CARD_BACK} alt="" />
          <img src={KENNEY_CARD_BACK} alt="" />
        </div>
      )}
    </div>
  )
}

function CardRow({ label, cards, compact = false }: { label: string; cards: readonly DoudizhuCardId[]; compact?: boolean }) {
  return (
    <div className={`${css.cardRow} ${compact ? css.compactCards : ''}`}>
      <span>{label}</span>
      <div>{cards.map(card => (
        <i key={card} data-red={isRedCard(card) || undefined}>
          <img src={KENNEY_CARD_IMAGES[card]} alt={cardLabel(card)} />
        </i>
      ))}</div>
    </div>
  )
}

function RecentActions({
  history,
  outcomes,
  t,
}: {
  history: DoudizhuPublicView['history']
  outcomes: readonly DoudizhuDecisionOutcome[] | undefined
  t: (key: LanGameKey) => string
}) {
  const start = Math.max(0, history.length - 5)
  const recent = history.slice(start)
  if (recent.length === 0) return null
  return (
    <div className={css.recentActions}>
      <span>{t('game.recent')}</span>
      <ol>
        {recent.map((entry, offset) => {
          const index = start + offset
          const previous = history[index - 1]
          const beforePrevious = history[index - 2]
          const fresh = 'combination' in entry
            && previous !== undefined
            && beforePrevious !== undefined
            && 'pass' in previous
            && 'pass' in beforePrevious
          const fallback = outcomes?.find(outcome => outcome.historyIndex === index)?.source === 'fallback'
          return (
            <li key={historyEntryKey(history, index)}>
              {fresh && <em>{t('game.newTrick')}</em>}
              {fallback && <b>{t('game.trustee')}</b>}
              {historyEntryLabel(entry, t)}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function TableMotionLayer({
  event,
  localSeat,
  t,
}: {
  event: TableMotionEvent
  localSeat: DoudizhuSeat
  t: (key: LanGameKey) => string
}) {
  const origin = 'seat' in event ? relativeSeat(event.seat, localSeat) : undefined
  return (
    <div className={css.motionLayer} data-motion-kind={event.kind} aria-hidden={event.kind !== 'settlement'}>
      {event.kind === 'deal' && (
        <div className={css.dealAnimation}>
          {Array.from({ length: 12 }, (_, index) => (
            <img
              key={index}
              src={KENNEY_CARD_BACK}
              alt=""
              data-target={(['left', 'right', 'bottom'] as const)[index % 3]}
              style={{ '--deal-index': index } as CSSProperties}
            />
          ))}
        </div>
      )}
      {event.kind === 'play' && (
        <div className={css.playFlight} data-origin={origin}>
          {event.cards.map(card => <img key={card} src={KENNEY_CARD_IMAGES[card]} alt="" />)}
        </div>
      )}
      {event.kind === 'pass' && <div className={css.passChip} data-origin={origin}>{t('game.passChip')}</div>}
      {event.kind === 'trick-reset' && <div className={css.trickReset}>{t('game.newTrick')}</div>}
      {event.kind === 'impact' && (
        <div className={css.impact} data-impact={event.impact}>
          {event.impact === 'rocket' ? t('game.rocket') : t('game.bomb')}
        </div>
      )}
      {event.kind === 'settlement' && (
        <div className={css.settlement} data-final={event.final} role="status">
          <strong>{event.final ? t('game.matchSettled') : t('game.roundSettled').replace('{round}', String(event.round))}</strong>
          {event.result !== undefined && (
            <span>{t('game.settlementScores')
              .replace('{a}', signedScore(event.result.scores[0]))
              .replace('{b}', signedScore(event.result.scores[1]))
              .replace('{c}', signedScore(event.result.scores[2]))}</span>
          )}
        </div>
      )}
    </div>
  )
}

function relativeSeat(seat: DoudizhuSeat, localSeat: DoudizhuSeat): 'left' | 'right' | 'bottom' {
  if (seat === localSeat) return 'bottom'
  return seat === (localSeat + 1) % 3 ? 'left' : 'right'
}

function signedScore(score: number): string {
  return score > 0 ? `+${score}` : String(score)
}

function historyEntryLabel(entry: DoudizhuPublicView['history'][number], t: (key: LanGameKey) => string): string {
  const seat = String(entry.seat + 1)
  if ('score' in entry) {
    return entry.score === 0
      ? t('game.noBid').replace('{seat}', seat)
      : t('game.bid').replace('{seat}', seat).replace('{score}', String(entry.score))
  }
  if ('pass' in entry) return t('game.pass').replace('{seat}', seat)
  return t('game.played')
    .replace('{seat}', seat)
    .replace('{cards}', entry.combination.cards.map(cardLabel).join(' '))
}

function phaseLabel(phase: LanRoomParticipantView['room']['phase'], t: (key: LanGameKey) => string): string {
  switch (phase) {
    case 'lobby': return t('room.waiting')
    case 'locked': return t('room.locked')
    case 'running': return t('room.running')
    case 'finished': return t('room.finished')
    default: phase satisfies never; return ''
  }
}

function compactId(value: string): string {
  return value.length <= 12 ? value : `${value.slice(0, 5)}…${value.slice(-4)}`
}

function gameStatus(
  roomPhase: LanRoomParticipantView['room']['phase'],
  game: ReturnType<typeof doudizhuTableSnapshot>,
  t: (key: LanGameKey) => string,
): string {
  if (game?.status === 'failed') return `${t('game.failed')}：${game.error}`
  if (game?.status === 'round-finished') return t('game.roundFinished')
  if (game?.state.phase === 'bidding') return t('game.bidding')
  if (game?.state.phase === 'playing') return t('game.playing')
  if (game?.state.phase === 'finished') return t('room.finished')
  return roomPhase === 'running' ? t('room.enginePending') : t('room.waiting')
}

function cardLabel(card: DoudizhuCardId): string {
  if (card === 'joker-small') return '小王'
  if (card === 'joker-big') return '大王'
  const prefix = card[0]
  const suit = prefix === 'C' ? '♣' : prefix === 'D' ? '♦' : prefix === 'H' ? '♥' : prefix === 'S' ? '♠' : ''
  return `${suit}${card.slice(1)}`
}

function isRedCard(card: DoudizhuCardId): boolean {
  return card.startsWith('D') || card.startsWith('H') || card === 'joker-big'
}
