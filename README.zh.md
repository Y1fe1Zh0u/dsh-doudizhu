# dsh-doudizhu

[English](README.md) | 中文

一个基于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的三人 AI 斗地主插件。三个人各自在本地配置一个 Agent，连进同一个可信局域网房间，然后看三个模型自己打完整场比赛。

## AI 斗地主怎么玩

斗地主是三人牌类游戏，一名玩家成为地主，另外两名玩家组成农民阵营。插件用确定性代码处理规则、合法出牌校验、计分、超时、恢复和完整公共牌谱。每个模型只会拿到自己的手牌、当前合法动作和本局完整公共历史，最终也只能提交一个合法的游戏动作。

三个人准备之前，都可以修改自己的策略 Prompt。v1 里，房间锁定之后，人类就成了牌桌边不能说话的公园老头，只能围观，不能插嘴叫分、出牌，也不能临场指挥自己的 Agent。普通 DSH 输入框会一直保留，所以牌局运行时，三个人照样能在各自的会话里做其他工作；后续版本会继续尝试新的互动玩法。

更有意思的是，普通 DSH Agent 可以直接修改自己的运行环境，也能执行和触发代码。插件热重载时，不需要丢掉正在进行的牌局；规则实现、Agent 行为和界面都可以继续改，权威牌局状态仍然保留。这让用 DSH 试验 AI 游戏的成本很低。

我也想继续探索一个方向，把局域网房间、自主 Agent 回合、恢复、回放和观战 UI 做成通用的 DSH 游戏底座，上面只叠不同游戏自己的规则引擎。这个边界怎么划最合适，我还在学习，很希望和做类似项目的人交流。

这个项目也受到我在 X 上看到的一个基于 DSH 的德州扑克项目启发。现在暂时没找回原帖，如果你知道项目地址，欢迎开个 Issue 告诉我，我会在这里补上准确的项目名、作者和链接。

## 包含内容

- 可信局域网房间、六位配对码、准备状态、固定座位和恢复令牌
- 独立隐藏 Game Session，只开放游戏动作工具
- 确定性的 54 张牌斗地主规则引擎和三局比赛运行时
- 决策超时与确定性托管策略
- 提供给每个 Agent 的完整结构化公共出牌历史
- SQLite 牌局事件、checkpoint、牌谱校验和崩溃恢复
- 心跳、有限重连、握手限流和未认证连接上限
- 面向观战的 Web 牌桌、Kenney 牌面、响应式布局、低动态模式，以及始终保留的 DSH 输入框

## 环境要求

- Node.js `^22.19.0` 或 `>=24`
- DeepSeek Harness `0.1.0-rc.8`
- Cordis `4.0.1`
- 标准 DSH Web Profile

所有 DSH 和 Cordis 集成都使用精确版本的 peer dependency。这个仓库不包含 DSH Core、DSH App、vendor 源码或 workspace 链接。

## 安装

每个参与者都要把带版本标签的 GitHub 插件安装到自己的 Web Profile：

```sh
dsh plugin --profile web add github:Y1fe1Zh0u/dsh-doudizhu#v0.1.1
```

重启 `dsh web`，打开任意会话并进入 `斗地主` 标签页。一人创建房间，另外两人使用页面显示的 `ws://` 地址和六位房间码加入。

Bundle 会加入房间服务、Agent 桥接、持久化、传输、比赛运行时和浏览器 UI，不需要修改 DSH Core。只有 `lan_game` 存储域会写入 `storages/lan-game.sqlite3`，Web Profile 里的其他数据继续沿用原本的存储配置。

## 更新

使用同一条命令安装更新的 tag，然后重启 Profile：

```sh
dsh plugin --profile web add github:Y1fe1Zh0u/dsh-doudizhu#v0.2.0
```

DSH 目前仍在开发者预览阶段，peer 版本会保持精确锁定。升级 DSH 前请先查看本项目的 Release Notes。

## 卸载

```sh
dsh plugin --profile web remove dsh-doudizhu
```

卸载只会停止加载插件，不会删除 `storages/lan-game.sqlite3`。如果还需要牌谱，请保留或归档这个文件。

## 架构

仓库最终发布为一个可安装的 npm package。Host 侧通过 `room`、`agent`、`persistence`、`transport`、`doudizhu` 和 `doudizhu-runtime` 等 subpath export 组成完整运行链，根 package row 提供浏览器客户端。每一步牌局状态都要先完成事件和 checkpoint 提交，浏览器动画只负责展示，不会反向控制权威状态。

局域网流量是明文，只适合可信 Wi-Fi。浏览器只连接本机 DSH Host，Host 进程负责局域网 WebSocket。房间码和恢复令牌可以验证成员身份，但无法抵御局域网中的主动监听者。

## 开发

```sh
pnpm install
pnpm run check
```

`check` 会运行类型检查、Lint、107 个测试、Host 和浏览器构建，以及发布包检查。发布包检查会生成真实 tarball，并拒绝打入 DSH Core、App、vendor 文件，以及 `workspace:`、`link:` 和本地 `file:` dependency。

## 许可证

仓库新增代码使用 Apache-2.0。源自 DeepSeek Harness 的部分在 `NOTICE` 和 `LICENSES/MIT.txt` 中保留 MIT 署名；Kenney 扑克牌素材保留随仓库提供的 CC0 声明。
