/** Snapshot-diffed motion events for the DouDizhu table. */
import { useEffect, useRef, useState } from 'react';
const MAX_QUEUED_ACTIONS = 4;
const MAX_QUEUED_EVENTS = 12;
/**
 * Derive presentation events from two committed snapshots.
 * Replaced/non-prefix histories are treated as hydration, never replayed.
 *
 * @param previous - Previously committed playable snapshot.
 * @param current - Newly committed playable snapshot.
 * @returns Presentation events needed to animate the transition.
 */
export function diffTableMotion(previous, current) {
    const events = [];
    const previousDeal = motionMetadata(previous).deal ?? 1;
    const currentDeal = motionMetadata(current).deal ?? 1;
    const dealChanged = current.round !== previous.round || currentDeal !== previousDeal;
    if (dealChanged)
        events.push({ key: `${current.round}:${currentDeal}:deal`, kind: 'deal' });
    const previousHistory = dealChanged ? [] : previous.state.history;
    const currentHistory = current.state.history;
    const isAppend = previousHistory.every((entry, index) => historyEntrySignature(entry) === historyEntrySignature(currentHistory[index]));
    if (isAppend) {
        for (let index = previousHistory.length; index < currentHistory.length; index += 1) {
            const entry = currentHistory[index];
            if (entry === undefined)
                continue;
            const key = historyMotionKey(current, entry, index);
            if ('score' in entry)
                continue;
            if ('pass' in entry) {
                events.push({ key, kind: 'pass', seat: entry.seat });
                if (isSecondPass(currentHistory, index))
                    events.push({ key: `${key}:reset`, kind: 'trick-reset' });
                continue;
            }
            events.push({ key, kind: 'play', seat: entry.seat, cards: entry.combination.cards });
            if (entry.combination.kind === 'bomb' || entry.combination.kind === 'rocket') {
                events.push({ key: `${key}:impact`, kind: 'impact', impact: entry.combination.kind });
            }
        }
    }
    if (previous.status !== current.status && (current.status === 'round-finished' || current.status === 'finished')) {
        const result = current.roundResults.at(-1);
        events.push({
            key: `${current.round}:${currentDeal}:settlement:${current.status}`,
            kind: 'settlement',
            final: current.status === 'finished',
            round: current.round,
            ...(result === undefined ? {} : { result }),
        });
    }
    return events;
}
/**
 * Stable identity for recent-action rows, including repeated identical actions.
 *
 * @param history - Public action history containing the row.
 * @param index - Zero-based index of the row to identify.
 * @returns A signature with an occurrence suffix unique within the history.
 */
export function historyEntryKey(history, index) {
    const entry = history[index];
    if (entry === undefined)
        return `missing:${index}`;
    const signature = historyEntrySignature(entry);
    let occurrence = 0;
    for (let cursor = 0; cursor <= index; cursor += 1) {
        const candidate = history[cursor];
        if (candidate !== undefined && historyEntrySignature(candidate) === signature)
            occurrence += 1;
    }
    return `${signature}:${occurrence}`;
}
/**
 * Keep at most four logical actions; beyond that, hydrate instead of playing catch-up.
 *
 * @param queued - Presentation events already waiting to run.
 * @param incoming - Newly derived presentation events.
 * @returns The bounded event queue, or only the latest settlement when overloaded.
 */
export function appendMotionEvents(queued, incoming) {
    const combined = [...queued, ...incoming];
    const actionCount = new Set(combined.map(motionEventGroupKey)).size;
    if (actionCount > MAX_QUEUED_ACTIONS)
        return combined.filter(event => event.kind === 'settlement').slice(-1);
    return combined.slice(0, MAX_QUEUED_EVENTS);
}
/**
 * Run committed events one at a time and flush all animation work while hidden.
 *
 * @param snapshot - Latest table snapshot, when one has been received.
 * @param roomPhase - Current room lifecycle phase used to detect the initial deal.
 * @returns Current motion presentation state for the table renderer.
 */
export function useTableMotion(snapshot, roomPhase) {
    const reducedMotion = usePrefersReducedMotion();
    const previous = useRef(undefined);
    const observedPreGame = useRef(false);
    const [queue, setQueue] = useState([]);
    const running = snapshot?.status === 'failed' ? undefined : snapshot;
    const finalSettlement = running?.status === 'finished' ? settlementEvent(running, true) : undefined;
    useEffect(() => {
        if (roomPhase === 'lobby' || roomPhase === 'locked')
            observedPreGame.current = true;
        if (running === undefined) {
            previous.current = undefined;
            setQueue([]);
            return;
        }
        if (reducedMotion || document.visibilityState === 'hidden') {
            previous.current = running;
            observedPreGame.current = false;
            setQueue([]);
            return;
        }
        const prior = previous.current;
        previous.current = running;
        if (prior === undefined) {
            if (observedPreGame.current && roomPhase === 'running' && running.status === 'running') {
                const deal = motionMetadata(running).deal ?? 1;
                setQueue([{ key: `${running.round}:${deal}:deal`, kind: 'deal' }]);
            }
            observedPreGame.current = false;
            return;
        }
        const next = diffTableMotion(prior, running);
        if (running.status === 'finished') {
            setQueue([]);
            return;
        }
        if (running.status === 'round-finished') {
            const settlement = next.find((candidate) => candidate.kind === 'settlement');
            setQueue(settlement === undefined ? [] : [settlement]);
            return;
        }
        if (next.length > 0)
            setQueue(current => appendMotionEvents(current, next));
    }, [reducedMotion, roomPhase, running]);
    const event = queue[0];
    useEffect(() => {
        if (event === undefined)
            return;
        const timeout = window.setTimeout(() => {
            setQueue(current => current[0]?.key === event.key ? current.slice(1) : current);
        }, eventDuration(event));
        return () => { window.clearTimeout(timeout); };
    }, [event]);
    useEffect(() => {
        const flush = () => {
            if (document.visibilityState === 'hidden')
                setQueue([]);
        };
        document.addEventListener('visibilitychange', flush);
        return () => { document.removeEventListener('visibilitychange', flush); };
    }, []);
    const hideLastPlay = running !== undefined && queue.some(candidate => candidate.kind === 'play'
        && samePlay(candidate, running.state.lastPlay));
    return { event, finalSettlement, hideLastPlay, reducedMotion };
}
function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(() => typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    useEffect(() => {
        if (typeof window.matchMedia !== 'function')
            return;
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => { setReduced(query.matches); };
        query.addEventListener('change', update);
        return () => { query.removeEventListener('change', update); };
    }, []);
    return reduced;
}
function historyMotionKey(snapshot, entry, index) {
    const metadata = motionMetadata(snapshot);
    const outcome = metadata.decisionOutcomes?.find(candidate => candidate.historyIndex === index);
    const version = outcome?.afterStateVersion ?? snapshot.state.version;
    return `${snapshot.round}:${metadata.deal ?? 1}:${version}:${index}:${historyEntrySignature(entry)}`;
}
function motionMetadata(snapshot) {
    return snapshot;
}
function historyEntrySignature(entry) {
    if (entry === undefined)
        return 'missing';
    if ('score' in entry)
        return `bid:${entry.seat}:${entry.score}`;
    if ('pass' in entry)
        return `pass:${entry.seat}`;
    return `play:${entry.seat}:${entry.combination.kind}:${entry.combination.cards.join(',')}`;
}
function isSecondPass(history, index) {
    const previous = history[index - 1];
    return previous !== undefined && 'pass' in previous;
}
function eventDuration(event) {
    switch (event.kind) {
        case 'deal': return 1_050;
        case 'play': return 480;
        case 'pass': return 420;
        case 'trick-reset': return 360;
        case 'impact': return 620;
        case 'settlement': return 2_000;
        default:
            event;
            return 0;
    }
}
function motionEventGroupKey(event) {
    return event.key.replace(/:(?:reset|impact)$/u, '');
}
function settlementEvent(snapshot, final) {
    const deal = motionMetadata(snapshot).deal ?? 1;
    const result = snapshot.roundResults.at(-1);
    return {
        key: `${snapshot.round}:${deal}:settlement:${final ? 'finished' : 'round-finished'}`,
        kind: 'settlement',
        final,
        round: snapshot.round,
        ...(result === undefined ? {} : { result }),
    };
}
function samePlay(event, play) {
    return play !== undefined
        && event.seat === play.seat
        && event.cards.length === play.combination.cards.length
        && event.cards.every((card, index) => card === play.combination.cards[index]);
}
//# sourceMappingURL=table-motion.js.map