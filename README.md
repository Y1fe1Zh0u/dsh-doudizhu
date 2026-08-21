# dsh-doudizhu

English | [中文](README.zh.md)

An autonomous three-player Dou Dizhu game for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Three people configure one local Agent each, join the same trusted LAN room, and watch the models play the complete match by themselves.

## Dou Dizhu with Agents

Dou Dizhu is a three-player climbing card game. One player becomes the landlord and plays against the other two farmers. This plugin keeps the rules, legal-action validation, scoring, timeouts, recovery, and public match history in deterministic code. Each model receives its private hand plus the complete public history and can submit only a legal game action.

Before everyone is ready, each person can edit their strategy Prompt. In v1, once the room locks, the humans become silent kibitzers at a park card table: they can watch, but cannot call bids, play cards, or talk their Agent into changing course. The normal DSH composer stays available, so all three participants can keep using their sessions for other work while the match runs. Later versions can explore more ways for spectators to participate.

The more interesting part is that a regular DSH Agent can modify its environment, execute or trigger code, and hot-reload plugins without throwing away the running match. Rules, Agent behavior, and UI can change while the authoritative game state continues, which makes experimenting with AI games unusually inexpensive.

One direction I want to explore is a reusable game foundation for DSH: LAN rooms, autonomous Agent turns, recovery, replay, and spectator UI would live in the base, while each game adds its own rule engine. I am still learning where that boundary should sit, so design discussions and examples from other projects are especially welcome.

This project was also inspired by a Texas Hold'em project built on DSH that I saw shared on X. I have not been able to recover the original link; if you know the project, please open an Issue and I will add the correct name and attribution here.

## What is included

- Trusted-LAN room hosting, pairing, readiness, fixed seats, and reconnect tokens
- Hidden Game Sessions that expose only the game-action tool
- A deterministic 54-card Dou Dizhu engine and three-round match runtime
- Decision deadlines with deterministic fallback play
- Complete structured public action history for every Agent
- SQLite match events, checkpoints, replay validation, and crash recovery
- Heartbeats, bounded reconnects, handshake rate limits, and unauthenticated connection limits
- A spectator-first Web table with Kenney card artwork, responsive layouts, reduced motion, and a resident DSH composer

## Requirements

- Node.js `^22.19.0` or `>=24`
- DeepSeek Harness `0.1.0-rc.8`
- Cordis `4.0.1`
- The standard DSH Web profile

All DSH and Cordis integrations are exact peer dependencies. This repository does not contain DSH core, DSH apps, vendor sources, or workspace links.

## Install

Install the tagged GitHub release into every participant's Web profile:

```sh
dsh plugin --profile web add github:Y1fe1Zh0u/dsh-doudizhu#v0.1.1
```

Restart `dsh web`, open a conversation, and select the `斗地主` tab. One participant creates the room; the other two join with the advertised `ws://` address and six-digit code.

The bundle adds the room, Agent bridge, persistence, transport, runtime, and browser UI plugins without changing DSH core. It routes only the `lan_game` storage domain to `storages/lan-game.sqlite3`; other Web-profile domains keep their existing storage configuration.

## Update

Install a newer tag with the same command and restart the profile:

```sh
dsh plugin --profile web add github:Y1fe1Zh0u/dsh-doudizhu#v0.2.0
```

Peer versions are intentionally exact while DSH remains in developer preview, so review the release notes before changing DSH versions.

## Remove

```sh
dsh plugin --profile web remove dsh-doudizhu
```

Removal stops loading the plugin but does not delete `storages/lan-game.sqlite3`. Keep or archive that file if you want the match history.

## Architecture

The repository ships one installable npm package with Host subpath exports for `room`, `agent`, `persistence`, `transport`, `doudizhu`, and `doudizhu-runtime`. The bare package row supplies the browser client. Match state advances only after its event and checkpoint commit, while browser animation remains a non-authoritative presentation layer.

LAN traffic is plaintext and is intended for a trusted Wi-Fi network. The browser talks only to its local DSH Host; Host processes own the LAN WebSocket connections. Pairing codes and resume tokens authenticate room membership but do not protect against an active observer on the network.

## Development

```sh
pnpm install
pnpm run check
```

`check` runs type checking, lint, 107 tests, Host and browser builds, and the publication guard. The guard builds a real tarball and rejects DSH core/apps/vendor files as well as `workspace:`, `link:`, and local `file:` dependency specifications.

## License

New repository work is licensed under Apache-2.0. DeepSeek Harness-derived portions retain their MIT attribution in `NOTICE` and `LICENSES/MIT.txt`. Kenney card artwork is covered by the included CC0 notice.
