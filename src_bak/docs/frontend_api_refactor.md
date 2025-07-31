# AI 调用逻辑前端化改造方案

**版本:** 1.0
**日期:** 2025-07-29

## 1. 目标

为了增强应用的安全性、保护用户隐私，并允许用户使用自己的 API 密钥，我们决定对应用的架构进行重构。本次改造的核心目标是将 AI 相关的 API 调用从后端 (Python) 迁移到前端 (JavaScript)。

通过此方案，用户的 API 密钥将仅保存在他们自己的浏览器本地存储中，永远不会被发送或暴露给我们的后端服务器。

## 2. 核心思想

将原来由 Python 后端发起的 AI API 请求，改为由用户浏览器中的 JavaScript 直接向 AI 服务商（如 OpenRouter）发起。

- **后端 (Python)**: 不再处理任何与 AI 相关的密钥、请求和响应。其职责将转变为一个纯粹的**状态管理器**和**历史记录器**。它接收前端处理好的 AI 结果，然后根据这些结果更新界面状态并保存历史。
- **前端 (JavaScript)**: 成为 AI 调用的**执行者**。它负责从用户处获取配置（API 密钥等）、构造并发送 API 请求、接收响应，然后将处理好的结果汇报给后端。

## 3. 架构变更

### 3.1. 前端 (JavaScript) 变更

1.  **新增设置界面**:
    - 在主界面上增加一个“设置”按钮。
    - 点击后，弹出一个模态框 (Modal)，包含以下输入字段：
        - **服务商 (Provider)**: 下拉菜单或文本输入框（例如，默认为 `openrouter`）。
        - **模型 (Model)**: 文本输入框（例如，默认为 `google/gemini-2.5-flash`）。
        - **API 密钥 (API Key)**: **密码类型**的输入框，确保输入时密钥不可见。
    - 提供“保存”按钮，将配置存入浏览器的 `localStorage`。

2.  **新增前端存储模块 (`storage.js`)**:
    - 创建一个新的 JS 文件（例如 `src/assets/storage.js`），用于封装 `localStorage` 操作。
    - 包含核心函数:
        - `saveUserConfig(config)`: 将用户的配置对象保存到 `localStorage`。
        - `getUserConfig()`: 从 `localStorage` 读取用户的配置。
        - `getApiKey()`: 一个安全地只返回 API 密钥的函数。

3.  **重构 AI 调用逻辑**:
    - 修改或新增客户端回调 (`app.clientside_callback`)。
    - 当用户输入问题后，新的流程如下：
        1.  调用 `getUserConfig()` 从 `localStorage` 获取用户配置。若未配置，则弹窗提示用户前往设置。
        2.  使用浏览器内置的 `fetch` API，构造请求（包含从 `localStorage` 获取的 `apiKey` 作为 `Authorization` 头），并行地向 AI 服务商发起三个贤者的回答请求。
        3.  等待所有请求完成后，将三个回答的结果组合成一个标准化的对象。
        4.  将这个包含最终结果的对象，赋值给一个专门用于前后端通信的 `dcc.Store` 组件。

### 3.2. 后端 (Python) 变更

1.  **移除 AI 调用逻辑**:
    - 大幅修改或删除 `src/api_routes.py` 中的 `annotated_question` 和 `wise_man_answer` 回调函数。
    - 后端不再需要 `ai.py` 中的大部分函数（如 `get_structured_answer`），可以考虑精简。
    - 不再需要直接读取 `OPENROUTER_API_KEY` 等环境变量用于 AI 调用。

2.  **新增结果监听回调**:
    - 创建一个新的后端回调函数，其 `Input` 监控的是前端填充了 AI 结果的 `dcc.Store`。
    - 当这个 `Store` 接收到来自前端的数据后，该回调被触发。

3.  **后端职责调整**:
    - **最终裁决**: 在新的结果监听回调中，根据前端传来的三个贤者的状态（yes, no, conditional）执行最终裁决逻辑。
    - **状态更新**: 根据裁决结果，返回更新后的值给各个UI组件（如最终状态图标、贤者回答内容等）。
    - **历史记录**: 在同个回调中，调用 `history_manager.py` 中的函数，将前端传来的完整数据保存到历史记录中。

## 4. 新的数据流

1.  **用户** 在前端输入问题，点击提交。
2.  **前端 (JS)** 捕获提交事件。
3.  **前端 (JS)** 从 `localStorage` 读取 API 密钥和模型配置。
4.  **前端 (JS)** 使用 `fetch` API 并行调用 AI 服务商接口三次。
5.  **前端 (JS)** 将三次调用的结果打包成一个 JSON 对象。
6.  **前端 (JS)** 将此 JSON 对象存入一个 `dcc.Store(id='ai-results-store')`。
7.  **后端 (Python)** 的一个回调函数以 `Input('ai-results-store', 'data')` 作为输入，被自动触发。
8.  **后端 (Python)** 在该回调中：
    a. 执行最终裁决。
    b. 更新界面 `Output`（最终状态、清空输入框等）。
    c. 调用历史记录模块，保存完整记录。
9.  **Dash** 框架将后端的 `Output` 更新同步到前端界面。

## 5. 方案优势

- **高安全性**: 用户 API 密钥永不离开浏览器，杜绝了服务器存储或传输密钥带来的风险。
- **保护用户隐私**: 用户的查询请求直接发送给 AI 服务商，不会经过我们的服务器。
- **灵活性与用户自主性**: 用户可以自由配置和更换他们想用的模型和供应商。
- **更清晰的架构**: 前后端职责更加分明，前端负责与外部API交互，后端负责内部状态管理和数据持久化。

## 6. 实施计划

我们将采用分步实施的策略，首先完成所有前端的修改，然后再进行后端对接。

### 6.1. 前端修改计划

**第一步：创建用户配置界面**
1.  **创建设置模态框组件**: 创建一个新的 React 组件 `src/components/settings_modal.js`。该组件将包含服务商、模型和 API 密钥的输入框，以及“保存”按钮。
2.  **添加设置按钮**: 在主布局中添加一个“设置”按钮，用于触发显示设置模态框。
3.  **更新主布局**: 将新的 `SettingsModal` 组件和触发按钮添加到 `src/main.py` 的 `app.layout` 中。

**第二步：实现浏览器本地存储**
1.  **创建配置存储模块**: 创建一个新的 JavaScript 文件 `src/assets/config_storage.js`。
2.  **实现核心函数**: 在该文件中，编写 `saveUserConfig(config)` 和 `getUserConfig()` 函数，用于将用户的设置安全地存入和读取浏览器的 `localStorage`。

**第三步：构建前端 AI 调用服务**
1.  **创建 AI 服务模块**: 创建一个新的 JavaScript 文件 `src/assets/ai_service.js`。
2.  **实现 AI 请求函数**: 在该文件中，编写核心函数 `fetchMagiAnswers(question)`。此函数将负责从 `localStorage` 获取配置，使用 `fetch` API 并行发起三个 AI 请求，并处理响应。

**第四步：集成并连接到 Dash**
1.  **添加数据存储组件**: 在 `src/main.py` 的 `app.layout` 中，添加一个新的 `dcc.Store`，ID 设为 `ai-results-store`，作为前后端的数据桥梁。
2.  **创建客户端回调**: 在 `main.py` 中编写一个新的 `app.clientside_callback`，监听用户输入，调用 `fetchMagiAnswers` 函数，并将最终结果输出到 `ai-results-store`。

### 6.2. 后端修改计划

**核心目标**：让后端停止直接调用 AI，转而监听并处理前端发送过来的 AI 结果。后端将从“执行者”转变为纯粹的“状态总指挥”。

**第一步：创建唯一的“结果处理”回调函数**
- **位置**: `src/api_routes.py`。
- **触发器 (Input)**: 仅由 `Input('ai-results-store', 'data')` 触发。
- **职责 (Outputs)**: 此回调将成为新的“总指挥”，全权负责根据 `ai-results-store` 中的数据，一次性更新所有相关的 UI 组件。这包括：
    1.  三贤者的回答面板 (`melchior-content`, `balthasar-content`, `casper-content`)。
    2.  三贤者的状态图标 (`melchior-status`, `balthasar-status`, `casper-status`)。
    3.  最终的决议状态 (`response.status`)。
    4.  清空用户输入框 (`query.value`)。
    5.  触发历史记录保存 (通过更新 `history-records.data`)。

**第二步：移除旧的、分散的后端回调**
- 在创建了新的“总指挥”回调后，原有的负责 AI 调用和分散更新的回调函数将变得多余。需要被安全地移除或重构：
    - `annotated_question` (职责已完全转移到前端)
    - `wise_man_answer` (职责已完全转移到前端)
    - `extention` (职责已完全转移到前端)
    - `response_status` (逻辑合并到新的“总指挥”回调中)
    - `update_melchior_answer`, `update_balthasar_answer`, `update_casper_answer` (逻辑合并到新的“总指挥”回调中)
    - `manage_history` 中关于**保存**的部分 (逻辑合并到新的“总指挥”回调中，但**清空历史**的功能会保留并单独处理)。

**第三步：代码精简与重构**
- **精简 `api_routes.py`**: 此文件将变得非常简洁，主要只包含新的“总指挥”回调和少数几个必要的辅助回调。
- **精简 `ai.py`**: 类似 `is_yes_or_no_question`, `get_structured_answer`, `parse_structured_response` 等函数在后端将不再需要，可以安全移除，为 `ai.py` 文件瘦身。
