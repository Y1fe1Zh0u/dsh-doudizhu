/** Durable schemas for resumable LAN game matches and local installation bindings. */
import { z } from 'zod';
import { DoudizhuCardId } from '../doudizhu/index.ts';
/** Schema for a committed bid, play, or pass action. */
export declare const doudizhuActionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"bid">;
    score: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"play">;
    cards: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"pass">;
}, z.core.$strip>], "type">;
/** Schema for the winner, multiplier, and seat scores of one settled round. */
export declare const doudizhuResultSchema: z.ZodObject<{
    winner: z.ZodEnum<{
        landlord: "landlord";
        farmers: "farmers";
    }>;
    spring: z.ZodEnum<{
        landlord: "landlord";
        farmers: "farmers";
        none: "none";
    }>;
    baseScore: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
    multiplier: z.ZodNumber;
    scores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
}, z.core.$strip>;
/** Schema for the complete deterministic DouDizhu engine state. */
export declare const doudizhuStateSchema: z.ZodObject<{
    version: z.ZodNumber;
    phase: z.ZodEnum<{
        finished: "finished";
        bidding: "bidding";
        playing: "playing";
        redeal: "redeal";
    }>;
    bidder: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    biddingStarter: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    bids: z.ZodArray<z.ZodObject<{
        seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        score: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
    }, z.core.$strip>>;
    highestBid: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
    highestBidder: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
    landlord: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
    currentSeat: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
    hands: z.ZodTuple<[z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>, z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>, z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>], null>;
    bottom: z.ZodTuple<[z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>, z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>, z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>], null>;
    lastPlay: z.ZodOptional<z.ZodObject<{
        seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        combination: z.ZodObject<{
            kind: z.ZodEnum<{
                single: "single";
                pair: "pair";
                triple: "triple";
                "triple-single": "triple-single";
                "triple-pair": "triple-pair";
                straight: "straight";
                "pair-straight": "pair-straight";
                airplane: "airplane";
                "airplane-single": "airplane-single";
                "airplane-pair": "airplane-pair";
                "four-two-single": "four-two-single";
                "four-two-pair": "four-two-pair";
                bomb: "bomb";
                rocket: "rocket";
            }>;
            cards: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
            primaryRank: z.ZodEnum<{
                SJ: "SJ";
                3: "3";
                4: "4";
                5: "5";
                6: "6";
                7: "7";
                8: "8";
                9: "9";
                10: "10";
                J: "J";
                Q: "Q";
                K: "K";
                A: "A";
                2: "2";
                BJ: "BJ";
            }>;
            chainLength: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    consecutivePasses: z.ZodNumber;
    multiplier: z.ZodNumber;
    playsBySeat: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    history: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        score: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
    }, z.core.$strip>, z.ZodObject<{
        seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        combination: z.ZodObject<{
            kind: z.ZodEnum<{
                single: "single";
                pair: "pair";
                triple: "triple";
                "triple-single": "triple-single";
                "triple-pair": "triple-pair";
                straight: "straight";
                "pair-straight": "pair-straight";
                airplane: "airplane";
                "airplane-single": "airplane-single";
                "airplane-pair": "airplane-pair";
                "four-two-single": "four-two-single";
                "four-two-pair": "four-two-pair";
                bomb: "bomb";
                rocket: "rocket";
            }>;
            cards: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
            primaryRank: z.ZodEnum<{
                SJ: "SJ";
                3: "3";
                4: "4";
                5: "5";
                6: "6";
                7: "7";
                8: "8";
                9: "9";
                10: "10";
                J: "J";
                Q: "Q";
                K: "K";
                A: "A";
                2: "2";
                BJ: "BJ";
            }>;
            chainLength: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        pass: z.ZodLiteral<true>;
    }, z.core.$strip>]>>;
    result: z.ZodOptional<z.ZodObject<{
        winner: z.ZodEnum<{
            landlord: "landlord";
            farmers: "farmers";
        }>;
        spring: z.ZodEnum<{
            landlord: "landlord";
            farmers: "farmers";
            none: "none";
        }>;
        baseScore: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        multiplier: z.ZodNumber;
        scores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/** Schema linking a committed history entry to its agent or fallback decision source. */
export declare const doudizhuDecisionOutcomeSchema: z.ZodObject<{
    historyIndex: z.ZodNumber;
    afterStateVersion: z.ZodNumber;
    seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    source: z.ZodEnum<{
        agent: "agent";
        fallback: "fallback";
    }>;
    fallbackReason: z.ZodOptional<z.ZodEnum<{
        disconnected: "disconnected";
        timeout: "timeout";
        "invalid-response": "invalid-response";
        "transport-error": "transport-error";
    }>>;
}, z.core.$strip>;
/** Schema for a replayable match projection at a specific event sequence. */
export declare const matchCheckpointSchema: z.ZodObject<{
    asOfSeq: z.ZodNumber;
    round: z.ZodNumber;
    deal: z.ZodNumber;
    state: z.ZodObject<{
        version: z.ZodNumber;
        phase: z.ZodEnum<{
            finished: "finished";
            bidding: "bidding";
            playing: "playing";
            redeal: "redeal";
        }>;
        bidder: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        biddingStarter: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        bids: z.ZodArray<z.ZodObject<{
            seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
            score: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        }, z.core.$strip>>;
        highestBid: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        highestBidder: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
        landlord: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
        currentSeat: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
        hands: z.ZodTuple<[z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>, z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>, z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>], null>;
        bottom: z.ZodTuple<[z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>, z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>, z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>], null>;
        lastPlay: z.ZodOptional<z.ZodObject<{
            seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
            combination: z.ZodObject<{
                kind: z.ZodEnum<{
                    single: "single";
                    pair: "pair";
                    triple: "triple";
                    "triple-single": "triple-single";
                    "triple-pair": "triple-pair";
                    straight: "straight";
                    "pair-straight": "pair-straight";
                    airplane: "airplane";
                    "airplane-single": "airplane-single";
                    "airplane-pair": "airplane-pair";
                    "four-two-single": "four-two-single";
                    "four-two-pair": "four-two-pair";
                    bomb: "bomb";
                    rocket: "rocket";
                }>;
                cards: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
                primaryRank: z.ZodEnum<{
                    SJ: "SJ";
                    3: "3";
                    4: "4";
                    5: "5";
                    6: "6";
                    7: "7";
                    8: "8";
                    9: "9";
                    10: "10";
                    J: "J";
                    Q: "Q";
                    K: "K";
                    A: "A";
                    2: "2";
                    BJ: "BJ";
                }>;
                chainLength: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        consecutivePasses: z.ZodNumber;
        multiplier: z.ZodNumber;
        playsBySeat: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        history: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
            score: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        }, z.core.$strip>, z.ZodObject<{
            seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
            combination: z.ZodObject<{
                kind: z.ZodEnum<{
                    single: "single";
                    pair: "pair";
                    triple: "triple";
                    "triple-single": "triple-single";
                    "triple-pair": "triple-pair";
                    straight: "straight";
                    "pair-straight": "pair-straight";
                    airplane: "airplane";
                    "airplane-single": "airplane-single";
                    "airplane-pair": "airplane-pair";
                    "four-two-single": "four-two-single";
                    "four-two-pair": "four-two-pair";
                    bomb: "bomb";
                    rocket: "rocket";
                }>;
                cards: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
                primaryRank: z.ZodEnum<{
                    SJ: "SJ";
                    3: "3";
                    4: "4";
                    5: "5";
                    6: "6";
                    7: "7";
                    8: "8";
                    9: "9";
                    10: "10";
                    J: "J";
                    Q: "Q";
                    K: "K";
                    A: "A";
                    2: "2";
                    BJ: "BJ";
                }>;
                chainLength: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>, z.ZodObject<{
            seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
            pass: z.ZodLiteral<true>;
        }, z.core.$strip>]>>;
        result: z.ZodOptional<z.ZodObject<{
            winner: z.ZodEnum<{
                landlord: "landlord";
                farmers: "farmers";
            }>;
            spring: z.ZodEnum<{
                landlord: "landlord";
                farmers: "farmers";
                none: "none";
            }>;
            baseScore: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            multiplier: z.ZodNumber;
            scores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    totalScores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    roundResults: z.ZodArray<z.ZodObject<{
        winner: z.ZodEnum<{
            landlord: "landlord";
            farmers: "farmers";
        }>;
        spring: z.ZodEnum<{
            landlord: "landlord";
            farmers: "farmers";
            none: "none";
        }>;
        baseScore: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        multiplier: z.ZodNumber;
        scores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    }, z.core.$strip>>;
    decisionOutcomes: z.ZodArray<z.ZodObject<{
        historyIndex: z.ZodNumber;
        afterStateVersion: z.ZodNumber;
        seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        source: z.ZodEnum<{
            agent: "agent";
            fallback: "fallback";
        }>;
        fallbackReason: z.ZodOptional<z.ZodEnum<{
            disconnected: "disconnected";
            timeout: "timeout";
            "invalid-response": "invalid-response";
            "transport-error": "transport-error";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/** Schema for a decision request that remains recoverable after restart. */
export declare const pendingDecisionSchema: z.ZodObject<{
    requestId: z.ZodString;
    attempt: z.ZodNumber;
    seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    stateVersion: z.ZodNumber;
    requestedAt: z.ZodString;
    deadlineAt: z.ZodString;
}, z.core.$strip>;
/** Schema for every durable event in a LAN game match log. */
export declare const matchEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"deal-started">;
    round: z.ZodNumber;
    deal: z.ZodNumber;
    deck: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
    biddingStarter: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    seq: z.ZodNumber;
    at: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"decision-requested">;
    requestId: z.ZodString;
    attempt: z.ZodNumber;
    seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    stateVersion: z.ZodNumber;
    requestedAt: z.ZodString;
    deadlineAt: z.ZodString;
    seq: z.ZodNumber;
    at: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"decision-abandoned">;
    requestId: z.ZodString;
    reason: z.ZodEnum<{
        disconnected: "disconnected";
        timeout: "timeout";
        "invalid-response": "invalid-response";
        "transport-error": "transport-error";
        superseded: "superseded";
        closed: "closed";
    }>;
    seq: z.ZodNumber;
    at: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"action-committed">;
    requestId: z.ZodString;
    seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    beforeStateVersion: z.ZodNumber;
    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"bid">;
        score: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"play">;
        cards: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"pass">;
    }, z.core.$strip>], "type">;
    source: z.ZodEnum<{
        agent: "agent";
        fallback: "fallback";
    }>;
    fallbackReason: z.ZodOptional<z.ZodEnum<{
        disconnected: "disconnected";
        timeout: "timeout";
        "invalid-response": "invalid-response";
        "transport-error": "transport-error";
    }>>;
    afterStateVersion: z.ZodNumber;
    seq: z.ZodNumber;
    at: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"round-finished">;
    round: z.ZodNumber;
    result: z.ZodObject<{
        winner: z.ZodEnum<{
            landlord: "landlord";
            farmers: "farmers";
        }>;
        spring: z.ZodEnum<{
            landlord: "landlord";
            farmers: "farmers";
            none: "none";
        }>;
        baseScore: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        multiplier: z.ZodNumber;
        scores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    }, z.core.$strip>;
    totalScores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    seq: z.ZodNumber;
    at: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"match-finished">;
    totalScores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    roundResults: z.ZodArray<z.ZodObject<{
        winner: z.ZodEnum<{
            landlord: "landlord";
            farmers: "farmers";
        }>;
        spring: z.ZodEnum<{
            landlord: "landlord";
            farmers: "farmers";
            none: "none";
        }>;
        baseScore: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        multiplier: z.ZodNumber;
        scores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    }, z.core.$strip>>;
    seq: z.ZodNumber;
    at: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"room-closed">;
    reason: z.ZodOptional<z.ZodString>;
    seq: z.ZodNumber;
    at: z.ZodString;
}, z.core.$strip>], "type">;
/** Schema for the durable room, event log, and latest validated checkpoint. */
export declare const matchRecordSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    game: z.ZodLiteral<"doudizhu">;
    rulesetVersion: z.ZodLiteral<1>;
    recordRevision: z.ZodNumber;
    authorityEpoch: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    expiresAt: z.ZodString;
    room: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        revision: z.ZodNumber;
        phase: z.ZodEnum<{
            lobby: "lobby";
            locked: "locked";
            running: "running";
            finished: "finished";
        }>;
        coordinatorId: z.ZodString;
        maxMembers: z.ZodNumber;
        members: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            seat: z.ZodNumber;
            ready: z.ZodBoolean;
            connected: z.ZodBoolean;
            promptHash: z.ZodOptional<z.ZodString>;
            resumeToken: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        result: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    config: z.ZodObject<{
        roundsPerMatch: z.ZodNumber;
        roundPauseMs: z.ZodNumber;
        decisionTimeoutMs: z.ZodNumber;
    }, z.core.$strip>;
    events: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"deal-started">;
        round: z.ZodNumber;
        deal: z.ZodNumber;
        deck: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
        biddingStarter: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        seq: z.ZodNumber;
        at: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"decision-requested">;
        requestId: z.ZodString;
        attempt: z.ZodNumber;
        seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        stateVersion: z.ZodNumber;
        requestedAt: z.ZodString;
        deadlineAt: z.ZodString;
        seq: z.ZodNumber;
        at: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"decision-abandoned">;
        requestId: z.ZodString;
        reason: z.ZodEnum<{
            disconnected: "disconnected";
            timeout: "timeout";
            "invalid-response": "invalid-response";
            "transport-error": "transport-error";
            superseded: "superseded";
            closed: "closed";
        }>;
        seq: z.ZodNumber;
        at: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"action-committed">;
        requestId: z.ZodString;
        seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        beforeStateVersion: z.ZodNumber;
        action: z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"bid">;
            score: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"play">;
            cards: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"pass">;
        }, z.core.$strip>], "type">;
        source: z.ZodEnum<{
            agent: "agent";
            fallback: "fallback";
        }>;
        fallbackReason: z.ZodOptional<z.ZodEnum<{
            disconnected: "disconnected";
            timeout: "timeout";
            "invalid-response": "invalid-response";
            "transport-error": "transport-error";
        }>>;
        afterStateVersion: z.ZodNumber;
        seq: z.ZodNumber;
        at: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"round-finished">;
        round: z.ZodNumber;
        result: z.ZodObject<{
            winner: z.ZodEnum<{
                landlord: "landlord";
                farmers: "farmers";
            }>;
            spring: z.ZodEnum<{
                landlord: "landlord";
                farmers: "farmers";
                none: "none";
            }>;
            baseScore: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            multiplier: z.ZodNumber;
            scores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, z.core.$strip>;
        totalScores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        seq: z.ZodNumber;
        at: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"match-finished">;
        totalScores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        roundResults: z.ZodArray<z.ZodObject<{
            winner: z.ZodEnum<{
                landlord: "landlord";
                farmers: "farmers";
            }>;
            spring: z.ZodEnum<{
                landlord: "landlord";
                farmers: "farmers";
                none: "none";
            }>;
            baseScore: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            multiplier: z.ZodNumber;
            scores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, z.core.$strip>>;
        seq: z.ZodNumber;
        at: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"room-closed">;
        reason: z.ZodOptional<z.ZodString>;
        seq: z.ZodNumber;
        at: z.ZodString;
    }, z.core.$strip>], "type">>;
    checkpoint: z.ZodObject<{
        asOfSeq: z.ZodNumber;
        round: z.ZodNumber;
        deal: z.ZodNumber;
        state: z.ZodObject<{
            version: z.ZodNumber;
            phase: z.ZodEnum<{
                finished: "finished";
                bidding: "bidding";
                playing: "playing";
                redeal: "redeal";
            }>;
            bidder: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
            biddingStarter: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
            bids: z.ZodArray<z.ZodObject<{
                seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
                score: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            }, z.core.$strip>>;
            highestBid: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            highestBidder: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
            landlord: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
            currentSeat: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
            hands: z.ZodTuple<[z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>, z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>, z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>], null>;
            bottom: z.ZodTuple<[z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>, z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>, z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>], null>;
            lastPlay: z.ZodOptional<z.ZodObject<{
                seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
                combination: z.ZodObject<{
                    kind: z.ZodEnum<{
                        single: "single";
                        pair: "pair";
                        triple: "triple";
                        "triple-single": "triple-single";
                        "triple-pair": "triple-pair";
                        straight: "straight";
                        "pair-straight": "pair-straight";
                        airplane: "airplane";
                        "airplane-single": "airplane-single";
                        "airplane-pair": "airplane-pair";
                        "four-two-single": "four-two-single";
                        "four-two-pair": "four-two-pair";
                        bomb: "bomb";
                        rocket: "rocket";
                    }>;
                    cards: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
                    primaryRank: z.ZodEnum<{
                        SJ: "SJ";
                        3: "3";
                        4: "4";
                        5: "5";
                        6: "6";
                        7: "7";
                        8: "8";
                        9: "9";
                        10: "10";
                        J: "J";
                        Q: "Q";
                        K: "K";
                        A: "A";
                        2: "2";
                        BJ: "BJ";
                    }>;
                    chainLength: z.ZodNumber;
                }, z.core.$strip>;
            }, z.core.$strip>>;
            consecutivePasses: z.ZodNumber;
            multiplier: z.ZodNumber;
            playsBySeat: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
            history: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
                score: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            }, z.core.$strip>, z.ZodObject<{
                seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
                combination: z.ZodObject<{
                    kind: z.ZodEnum<{
                        single: "single";
                        pair: "pair";
                        triple: "triple";
                        "triple-single": "triple-single";
                        "triple-pair": "triple-pair";
                        straight: "straight";
                        "pair-straight": "pair-straight";
                        airplane: "airplane";
                        "airplane-single": "airplane-single";
                        "airplane-pair": "airplane-pair";
                        "four-two-single": "four-two-single";
                        "four-two-pair": "four-two-pair";
                        bomb: "bomb";
                        rocket: "rocket";
                    }>;
                    cards: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<DoudizhuCardId, string>>>;
                    primaryRank: z.ZodEnum<{
                        SJ: "SJ";
                        3: "3";
                        4: "4";
                        5: "5";
                        6: "6";
                        7: "7";
                        8: "8";
                        9: "9";
                        10: "10";
                        J: "J";
                        Q: "Q";
                        K: "K";
                        A: "A";
                        2: "2";
                        BJ: "BJ";
                    }>;
                    chainLength: z.ZodNumber;
                }, z.core.$strip>;
            }, z.core.$strip>, z.ZodObject<{
                seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
                pass: z.ZodLiteral<true>;
            }, z.core.$strip>]>>;
            result: z.ZodOptional<z.ZodObject<{
                winner: z.ZodEnum<{
                    landlord: "landlord";
                    farmers: "farmers";
                }>;
                spring: z.ZodEnum<{
                    landlord: "landlord";
                    farmers: "farmers";
                    none: "none";
                }>;
                baseScore: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
                multiplier: z.ZodNumber;
                scores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        totalScores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        roundResults: z.ZodArray<z.ZodObject<{
            winner: z.ZodEnum<{
                landlord: "landlord";
                farmers: "farmers";
            }>;
            spring: z.ZodEnum<{
                landlord: "landlord";
                farmers: "farmers";
                none: "none";
            }>;
            baseScore: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            multiplier: z.ZodNumber;
            scores: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, z.core.$strip>>;
        decisionOutcomes: z.ZodArray<z.ZodObject<{
            historyIndex: z.ZodNumber;
            afterStateVersion: z.ZodNumber;
            seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
            source: z.ZodEnum<{
                agent: "agent";
                fallback: "fallback";
            }>;
            fallbackReason: z.ZodOptional<z.ZodEnum<{
                disconnected: "disconnected";
                timeout: "timeout";
                "invalid-response": "invalid-response";
                "transport-error": "transport-error";
            }>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    pendingDecision: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodString;
        attempt: z.ZodNumber;
        seat: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
        stateVersion: z.ZodNumber;
        requestedAt: z.ZodString;
        deadlineAt: z.ZodString;
    }, z.core.$strip>>;
    finishedAt: z.ZodOptional<z.ZodString>;
    closedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** Schema for installation-local session and credential references for one room. */
export declare const localBindingSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    roomId: z.ZodString;
    role: z.ZodEnum<{
        coordinator: "coordinator";
        participant: "participant";
    }>;
    memberId: z.ZodString;
    parentSessionId: z.ZodString;
    gameSessionId: z.ZodOptional<z.ZodString>;
    strategyPrompt: z.ZodOptional<z.ZodString>;
    promptHash: z.ZodString;
    coordinatorUrl: z.ZodString;
    resumeToken: z.ZodOptional<z.ZodString>;
    state: z.ZodEnum<{
        finished: "finished";
        active: "active";
        closed: "closed";
        archived: "archived";
    }>;
    updatedAt: z.ZodString;
}, z.core.$strip>;
/** Validated durable representation of a committed game action. */
export type DoudizhuActionRecord = z.infer<typeof doudizhuActionSchema>;
/** Deterministic match projection captured at an event sequence. */
export type MatchCheckpoint = z.infer<typeof matchCheckpointSchema>;
/** Recoverable agent-decision request awaiting commitment or abandonment. */
export type PendingDecision = z.infer<typeof pendingDecisionSchema>;
/** One validated entry in the durable match event log. */
export type MatchEvent = z.infer<typeof matchEventSchema>;
/** Complete durable representation of one LAN game match. */
export type MatchRecord = z.infer<typeof matchRecordSchema>;
/** Installation-local session and credential references for one room. */
export type LocalBinding = z.infer<typeof localBindingSchema>;
/** The complete LAN game durable layout: room matches plus installation-local bindings. */
export declare const lanGameDomainSpec: {
    name: string;
    version: number;
    tables: {
        matches: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            schemaVersion: 1;
            game: "doudizhu";
            rulesetVersion: 1;
            recordRevision: number;
            authorityEpoch: number;
            createdAt: string;
            updatedAt: string;
            expiresAt: string;
            room: {
                id: string;
                code: string;
                revision: number;
                phase: "lobby" | "locked" | "running" | "finished";
                coordinatorId: string;
                maxMembers: number;
                members: {
                    id: string;
                    seat: number;
                    ready: boolean;
                    connected: boolean;
                    promptHash?: string | undefined;
                    resumeToken?: string | undefined;
                }[];
                result?: string | undefined;
            };
            config: {
                roundsPerMatch: number;
                roundPauseMs: number;
                decisionTimeoutMs: number;
            };
            events: ({
                type: "deal-started";
                round: number;
                deal: number;
                deck: DoudizhuCardId[];
                biddingStarter: 0 | 1 | 2;
                seq: number;
                at: string;
            } | {
                type: "decision-requested";
                requestId: string;
                attempt: number;
                seat: 0 | 1 | 2;
                stateVersion: number;
                requestedAt: string;
                deadlineAt: string;
                seq: number;
                at: string;
            } | {
                type: "decision-abandoned";
                requestId: string;
                reason: "disconnected" | "timeout" | "invalid-response" | "transport-error" | "superseded" | "closed";
                seq: number;
                at: string;
            } | {
                type: "action-committed";
                requestId: string;
                seat: 0 | 1 | 2;
                beforeStateVersion: number;
                action: {
                    type: "bid";
                    score: 0 | 1 | 2 | 3;
                } | {
                    type: "play";
                    cards: DoudizhuCardId[];
                } | {
                    type: "pass";
                };
                source: "agent" | "fallback";
                afterStateVersion: number;
                seq: number;
                at: string;
                fallbackReason?: "disconnected" | "timeout" | "invalid-response" | "transport-error" | undefined;
            } | {
                type: "round-finished";
                round: number;
                result: {
                    winner: "landlord" | "farmers";
                    spring: "landlord" | "farmers" | "none";
                    baseScore: 1 | 2 | 3;
                    multiplier: number;
                    scores: [number, number, number];
                };
                totalScores: [number, number, number];
                seq: number;
                at: string;
            } | {
                type: "match-finished";
                totalScores: [number, number, number];
                roundResults: {
                    winner: "landlord" | "farmers";
                    spring: "landlord" | "farmers" | "none";
                    baseScore: 1 | 2 | 3;
                    multiplier: number;
                    scores: [number, number, number];
                }[];
                seq: number;
                at: string;
            } | {
                type: "room-closed";
                seq: number;
                at: string;
                reason?: string | undefined;
            })[];
            checkpoint: {
                asOfSeq: number;
                round: number;
                deal: number;
                state: {
                    version: number;
                    phase: "finished" | "bidding" | "playing" | "redeal";
                    bidder: 0 | 1 | 2;
                    biddingStarter: 0 | 1 | 2;
                    bids: {
                        seat: 0 | 1 | 2;
                        score: 0 | 1 | 2 | 3;
                    }[];
                    highestBid: 0 | 1 | 2 | 3;
                    hands: [DoudizhuCardId[], DoudizhuCardId[], DoudizhuCardId[]];
                    bottom: [DoudizhuCardId, DoudizhuCardId, DoudizhuCardId];
                    consecutivePasses: number;
                    multiplier: number;
                    playsBySeat: [number, number, number];
                    history: ({
                        seat: 0 | 1 | 2;
                        combination: {
                            kind: "single" | "pair" | "triple" | "triple-single" | "triple-pair" | "straight" | "pair-straight" | "airplane" | "airplane-single" | "airplane-pair" | "four-two-single" | "four-two-pair" | "bomb" | "rocket";
                            cards: DoudizhuCardId[];
                            primaryRank: "SJ" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A" | "2" | "BJ";
                            chainLength: number;
                        };
                    } | {
                        seat: 0 | 1 | 2;
                        score: 0 | 1 | 2 | 3;
                    } | {
                        seat: 0 | 1 | 2;
                        pass: true;
                    })[];
                    highestBidder?: 0 | 1 | 2 | undefined;
                    landlord?: 0 | 1 | 2 | undefined;
                    currentSeat?: 0 | 1 | 2 | undefined;
                    lastPlay?: {
                        seat: 0 | 1 | 2;
                        combination: {
                            kind: "single" | "pair" | "triple" | "triple-single" | "triple-pair" | "straight" | "pair-straight" | "airplane" | "airplane-single" | "airplane-pair" | "four-two-single" | "four-two-pair" | "bomb" | "rocket";
                            cards: DoudizhuCardId[];
                            primaryRank: "SJ" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A" | "2" | "BJ";
                            chainLength: number;
                        };
                    } | undefined;
                    result?: {
                        winner: "landlord" | "farmers";
                        spring: "landlord" | "farmers" | "none";
                        baseScore: 1 | 2 | 3;
                        multiplier: number;
                        scores: [number, number, number];
                    } | undefined;
                };
                totalScores: [number, number, number];
                roundResults: {
                    winner: "landlord" | "farmers";
                    spring: "landlord" | "farmers" | "none";
                    baseScore: 1 | 2 | 3;
                    multiplier: number;
                    scores: [number, number, number];
                }[];
                decisionOutcomes: {
                    historyIndex: number;
                    afterStateVersion: number;
                    seat: 0 | 1 | 2;
                    source: "agent" | "fallback";
                    fallbackReason?: "disconnected" | "timeout" | "invalid-response" | "transport-error" | undefined;
                }[];
            };
            pendingDecision?: {
                requestId: string;
                attempt: number;
                seat: 0 | 1 | 2;
                stateVersion: number;
                requestedAt: string;
                deadlineAt: string;
            } | undefined;
            finishedAt?: string | undefined;
            closedAt?: string | undefined;
        }>;
        bindings: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            schemaVersion: 1;
            roomId: string;
            role: "coordinator" | "participant";
            memberId: string;
            parentSessionId: string;
            promptHash: string;
            coordinatorUrl: string;
            state: "finished" | "active" | "closed" | "archived";
            updatedAt: string;
            gameSessionId?: string | undefined;
            strategyPrompt?: string | undefined;
            resumeToken?: string | undefined;
        }>;
    };
};
//# sourceMappingURL=spec.d.ts.map