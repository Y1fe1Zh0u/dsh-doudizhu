import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Full conversation-view card table with lobby controls. */
import { useEffect, useState } from 'react';
import { doudizhuPrivateSnapshot, doudizhuTableSnapshot } from "./game-view.js";
import { KENNEY_CARD_BACK, KENNEY_CARD_IMAGES } from "./card-assets.generated.js";
import { historyEntryKey, useTableMotion } from "./table-motion.js";
import css from './LanGameTable.module.css';
const DEFAULT_PROMPT = '稳健出牌，优先保留炸弹，并根据已经出现的牌推断剩余牌型。';
/** Render setup, lobby, and autonomous-game states without replacing the resident composer. */
export function LanGameTable({ useLanGame, start, host, join, updatePrompt, setReady, leave, t, }) {
    const state = useLanGame(value => value);
    const [strategyPrompt, setStrategyPrompt] = useState(DEFAULT_PROMPT);
    const [url, setUrl] = useState('');
    const [code, setCode] = useState('');
    useEffect(start, [start]);
    const savedPrompt = state.participant?.strategyPrompt;
    useEffect(() => {
        if (savedPrompt !== undefined)
            setStrategyPrompt(savedPrompt);
    }, [savedPrompt]);
    if (state.status === 'loading')
        return _jsx("div", { className: css.loading, children: t('state.loading') });
    if (state.status === 'idle' || state.participant === undefined) {
        return (_jsx("main", { className: css.setup, "data-lan-game-table": "setup", children: _jsxs("section", { className: css.setupCard, children: [_jsx("div", { className: css.eyebrow, children: "DSH \u00B7 LAN AGENT GAME" }), _jsx("h2", { children: t('setup.title') }), _jsx("p", { children: t('setup.subtitle') }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('prompt.label') }), _jsx("textarea", { value: strategyPrompt, onChange: (event) => { setStrategyPrompt(event.target.value); }, placeholder: t('prompt.placeholder') })] }), _jsx("button", { className: css.primaryButton, type: "button", disabled: state.pending || strategyPrompt.trim() === '', onClick: () => { void host(strategyPrompt); }, children: t('host.action') }), _jsx("div", { className: css.divider, children: _jsx("span", { children: "\u6216" }) }), _jsxs("div", { className: css.joinGrid, children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('join.url') }), _jsx("input", { value: url, onChange: (event) => { setUrl(event.target.value); }, placeholder: "ws://192.168.1.8:43120/" })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('join.code') }), _jsx("input", { value: code, inputMode: "numeric", maxLength: 6, onChange: (event) => { setCode(event.target.value.replace(/\D/gu, '')); }, placeholder: "123456" })] })] }), _jsx("button", { className: css.secondaryButton, type: "button", disabled: state.pending || strategyPrompt.trim() === '' || url.trim() === '' || code.length !== 6, onClick: () => { void join({ url, code, strategyPrompt }); }, children: t('join.action') }), state.error !== undefined && _jsx("p", { className: css.error, role: "alert", children: state.error })] }) }));
    }
    return (_jsx(RoomTable, { state: state, participant: state.participant, strategyPrompt: strategyPrompt, setStrategyPrompt: setStrategyPrompt, updatePrompt: updatePrompt, setReady: setReady, leave: leave, t: t }));
}
function RoomTable({ state, participant, strategyPrompt, setStrategyPrompt, updatePrompt, setReady, leave, t }) {
    const { room } = participant;
    const me = room.members.find(member => member.id === participant.memberId);
    const seats = Array.from({ length: room.maxMembers }, (_, seat) => room.members.find(member => member.seat === seat));
    const game = doudizhuTableSnapshot(participant.game);
    const privateGame = doudizhuPrivateSnapshot(participant.privateGame);
    const publicGame = game?.status === 'failed' ? undefined : game?.state;
    const activeSeat = game?.status === 'failed' ? undefined : game?.decisionSeat ?? publicGame?.currentSeat;
    const decisionOutcomes = game?.status === 'failed' ? undefined : game?.decisionOutcomes;
    const localSeat = (me?.seat ?? 0);
    const leftSeat = ((localSeat + 1) % 3);
    const rightSeat = ((localSeat + 2) % 3);
    const editable = room.phase === 'lobby' && !me?.ready;
    const motion = useTableMotion(game, room.phase);
    const displayedLastPlay = motion.hideLastPlay ? undefined : publicGame?.lastPlay;
    return (_jsxs("main", { className: css.room, "data-lan-game-table": room.phase, children: [_jsxs("header", { className: css.roomHeader, children: [_jsxs("div", { children: [_jsx("span", { className: css.eyebrow, children: "DSH \u00B7 AUTONOMOUS TABLE" }), _jsx("strong", { children: phaseLabel(room.phase, t) })] }), _jsxs("div", { className: css.roomCode, children: [_jsx("span", { children: t('room.code') }), _jsx("b", { children: room.code })] })] }), _jsxs("section", { className: css.table, "aria-label": t('setup.title'), children: [_jsx(Seat, { member: seats[leftSeat], me: participant.memberId, position: "left", count: publicGame?.cardCounts[leftSeat], landlord: publicGame?.landlord === leftSeat, active: activeSeat === leftSeat, t: t }), _jsx(Seat, { member: seats[rightSeat], me: participant.memberId, position: "right", count: publicGame?.cardCounts[rightSeat], landlord: publicGame?.landlord === rightSeat, active: activeSeat === rightSeat, t: t }), _jsxs("div", { className: css.tableHud, children: [_jsx("span", { children: "DSH" }), _jsx("b", { children: "\u6597\u5730\u4E3B" }), _jsx("small", { children: gameStatus(room.phase, game, t) }), game !== undefined && game.status !== 'failed' && (_jsx("span", { className: css.matchRound, children: t('game.round')
                                    .replace('{round}', String(game.round))
                                    .replace('{total}', String(game.totalRounds)) })), publicGame !== undefined && _jsx("em", { children: t('game.multiplier').replace('{value}', String(publicGame.multiplier)) }), game !== undefined && game.status !== 'failed' && (_jsx("span", { className: css.totalScore, children: t('game.totalScore')
                                    .replace('{a}', String(game.totalScores[0]))
                                    .replace('{b}', String(game.totalScores[1]))
                                    .replace('{c}', String(game.totalScores[2])) }))] }), publicGame !== undefined && publicGame.bottom.length > 0 && (_jsx("div", { className: css.bottomCards, children: _jsx(CardRow, { label: t('game.bottom'), cards: publicGame.bottom, compact: true }) })), publicGame !== undefined && (displayedLastPlay !== undefined || publicGame.history.length > 0) && (_jsxs("div", { className: css.playRail, "data-lan-game-play-rail": true, children: [displayedLastPlay !== undefined && _jsx(CardRow, { label: t('game.lastPlay'), cards: displayedLastPlay.combination.cards }), _jsx(RecentActions, { history: publicGame.history, outcomes: decisionOutcomes, t: t })] })), _jsxs("div", { className: css.localPlayerArea, children: [_jsx(Seat, { member: seats[localSeat], me: participant.memberId, position: "bottom", count: publicGame?.cardCounts[localSeat], landlord: publicGame?.landlord === localSeat, active: activeSeat === localSeat, t: t }), privateGame !== undefined && privateGame.yourCards.length > 0 && (_jsx("div", { className: css.hand, "aria-label": t('game.yourCards'), children: _jsx(CardRow, { label: t('game.yourCards'), cards: privateGame.yourCards }) }))] }), motion.finalSettlement !== undefined && (_jsx(TableMotionLayer, { event: motion.finalSettlement, localSeat: localSeat, t: t })), motion.finalSettlement === undefined && !motion.reducedMotion && motion.event !== undefined && (_jsx(TableMotionLayer, { event: motion.event, localSeat: localSeat, t: t }))] }), _jsxs("aside", { className: css.controlPanel, children: [participant.role === 'coordinator' && room.phase === 'lobby' && (_jsxs("div", { className: css.share, children: [_jsx("span", { children: t('room.copyHint') }), participant.joinUrls.map(joinUrl => _jsx("code", { children: joinUrl }, joinUrl))] })), room.phase === 'lobby' ? (_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('prompt.label') }), _jsx("textarea", { value: strategyPrompt, disabled: !editable || state.pending, onChange: (event) => { setStrategyPrompt(event.target.value); } })] })) : (_jsxs("details", { className: css.lockedStrategy, children: [_jsx("summary", { children: t('prompt.locked') }), _jsx("p", { children: strategyPrompt })] })), _jsxs("div", { className: css.actions, children: [editable && _jsx("button", { className: css.secondaryButton, type: "button", disabled: state.pending || strategyPrompt.trim() === '', onClick: () => { void updatePrompt(strategyPrompt); }, children: t('room.savePrompt') }), room.phase === 'lobby' && _jsx("button", { className: css.primaryButton, type: "button", disabled: state.pending, onClick: () => { void setReady(!me?.ready); }, children: me?.ready ? t('room.cancelReady') : t('room.ready') }), room.phase === 'lobby' && _jsx("button", { className: css.ghostButton, type: "button", disabled: state.pending, onClick: () => { void leave(); }, children: t('room.leave') }), room.phase === 'finished' && _jsx("button", { className: css.primaryButton, type: "button", disabled: state.pending, onClick: () => { void leave(); }, children: t('room.newRoom') })] }), state.error !== undefined && _jsx("p", { className: css.error, role: "alert", children: state.error })] })] }));
}
function Seat({ member, me, position, count, landlord, active, t }) {
    const connected = member?.connected ?? false;
    return (_jsxs("div", { className: `${css.seat} ${css[position]} ${active && connected ? css.activeSeat : ''} ${member !== undefined && !connected ? css.offlineSeat : ''}`, "data-connected": member === undefined ? undefined : connected, children: [_jsx("div", { className: css.avatar, children: member === undefined ? '?' : member.seat + 1 }), _jsxs("div", { className: css.seatCopy, "data-connected": member === undefined ? undefined : connected, children: [_jsx("strong", { children: member === undefined ? t('seat.empty') : member.id === me ? t('seat.you') : compactId(member.id) }), member !== undefined && (_jsx("small", { children: !member.connected
                            ? t('seat.offline')
                            : landlord
                                ? t('game.landlord')
                                : count === undefined
                                    ? member.ready ? t('seat.ready') : t('seat.notReady')
                                    : t('game.cardsLeft').replace('{count}', String(count)) })), active && _jsx("span", { className: css.turnBadge, children: t('game.turn') })] }), member !== undefined && (_jsxs("div", { className: css.cardFan, "aria-hidden": "true", children: [_jsx("img", { src: KENNEY_CARD_BACK, alt: "" }), _jsx("img", { src: KENNEY_CARD_BACK, alt: "" }), _jsx("img", { src: KENNEY_CARD_BACK, alt: "" })] }))] }));
}
function CardRow({ label, cards, compact = false }) {
    return (_jsxs("div", { className: `${css.cardRow} ${compact ? css.compactCards : ''}`, children: [_jsx("span", { children: label }), _jsx("div", { children: cards.map(card => (_jsx("i", { "data-red": isRedCard(card) || undefined, children: _jsx("img", { src: KENNEY_CARD_IMAGES[card], alt: cardLabel(card) }) }, card))) })] }));
}
function RecentActions({ history, outcomes, t, }) {
    const start = Math.max(0, history.length - 5);
    const recent = history.slice(start);
    if (recent.length === 0)
        return null;
    return (_jsxs("div", { className: css.recentActions, children: [_jsx("span", { children: t('game.recent') }), _jsx("ol", { children: recent.map((entry, offset) => {
                    const index = start + offset;
                    const previous = history[index - 1];
                    const beforePrevious = history[index - 2];
                    const fresh = 'combination' in entry
                        && previous !== undefined
                        && beforePrevious !== undefined
                        && 'pass' in previous
                        && 'pass' in beforePrevious;
                    const fallback = outcomes?.find(outcome => outcome.historyIndex === index)?.source === 'fallback';
                    return (_jsxs("li", { children: [fresh && _jsx("em", { children: t('game.newTrick') }), fallback && _jsx("b", { children: t('game.trustee') }), historyEntryLabel(entry, t)] }, historyEntryKey(history, index)));
                }) })] }));
}
function TableMotionLayer({ event, localSeat, t, }) {
    const origin = 'seat' in event ? relativeSeat(event.seat, localSeat) : undefined;
    return (_jsxs("div", { className: css.motionLayer, "data-motion-kind": event.kind, "aria-hidden": event.kind !== 'settlement', children: [event.kind === 'deal' && (_jsx("div", { className: css.dealAnimation, children: Array.from({ length: 12 }, (_, index) => (_jsx("img", { src: KENNEY_CARD_BACK, alt: "", "data-target": ['left', 'right', 'bottom'][index % 3], style: { '--deal-index': index } }, index))) })), event.kind === 'play' && (_jsx("div", { className: css.playFlight, "data-origin": origin, children: event.cards.map(card => _jsx("img", { src: KENNEY_CARD_IMAGES[card], alt: "" }, card)) })), event.kind === 'pass' && _jsx("div", { className: css.passChip, "data-origin": origin, children: t('game.passChip') }), event.kind === 'trick-reset' && _jsx("div", { className: css.trickReset, children: t('game.newTrick') }), event.kind === 'impact' && (_jsx("div", { className: css.impact, "data-impact": event.impact, children: event.impact === 'rocket' ? t('game.rocket') : t('game.bomb') })), event.kind === 'settlement' && (_jsxs("div", { className: css.settlement, "data-final": event.final, role: "status", children: [_jsx("strong", { children: event.final ? t('game.matchSettled') : t('game.roundSettled').replace('{round}', String(event.round)) }), event.result !== undefined && (_jsx("span", { children: t('game.settlementScores')
                            .replace('{a}', signedScore(event.result.scores[0]))
                            .replace('{b}', signedScore(event.result.scores[1]))
                            .replace('{c}', signedScore(event.result.scores[2])) }))] }))] }));
}
function relativeSeat(seat, localSeat) {
    if (seat === localSeat)
        return 'bottom';
    return seat === (localSeat + 1) % 3 ? 'left' : 'right';
}
function signedScore(score) {
    return score > 0 ? `+${score}` : String(score);
}
function historyEntryLabel(entry, t) {
    const seat = String(entry.seat + 1);
    if ('score' in entry) {
        return entry.score === 0
            ? t('game.noBid').replace('{seat}', seat)
            : t('game.bid').replace('{seat}', seat).replace('{score}', String(entry.score));
    }
    if ('pass' in entry)
        return t('game.pass').replace('{seat}', seat);
    return t('game.played')
        .replace('{seat}', seat)
        .replace('{cards}', entry.combination.cards.map(cardLabel).join(' '));
}
function phaseLabel(phase, t) {
    switch (phase) {
        case 'lobby': return t('room.waiting');
        case 'locked': return t('room.locked');
        case 'running': return t('room.running');
        case 'finished': return t('room.finished');
        default:
            phase;
            return '';
    }
}
function compactId(value) {
    return value.length <= 12 ? value : `${value.slice(0, 5)}…${value.slice(-4)}`;
}
function gameStatus(roomPhase, game, t) {
    if (game?.status === 'failed')
        return `${t('game.failed')}：${game.error}`;
    if (game?.status === 'round-finished')
        return t('game.roundFinished');
    if (game?.state.phase === 'bidding')
        return t('game.bidding');
    if (game?.state.phase === 'playing')
        return t('game.playing');
    if (game?.state.phase === 'finished')
        return t('room.finished');
    return roomPhase === 'running' ? t('room.enginePending') : t('room.waiting');
}
function cardLabel(card) {
    if (card === 'joker-small')
        return '小王';
    if (card === 'joker-big')
        return '大王';
    const prefix = card[0];
    const suit = prefix === 'C' ? '♣' : prefix === 'D' ? '♦' : prefix === 'H' ? '♥' : prefix === 'S' ? '♠' : '';
    return `${suit}${card.slice(1)}`;
}
function isRedCard(card) {
    return card.startsWith('D') || card.startsWith('H') || card === 'joker-big';
}
//# sourceMappingURL=LanGameTable.js.map