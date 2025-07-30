## 中文


### 技术架构

本项目采用前后端分离的架构设计：

* **前端技术:**
  * 基于React和Dash框架构建的交互式界面
  * 纯CSS实现的动画和过渡效果
  * 本地存储(localStorage)实现的配置和历史记录管理
  * 原生JavaScript实现的音效系统

* **后端技术:**
  * Python Flask提供API服务
  * 异步处理机制实现并行请求多个AI模型
  * 安全的API密钥管理和请求转发
  * 历史记录的持久化存储

* **AI集成:**
  * 支持OpenAI、Anthropic Claude等多种大型语言模型
  * 自定义提示词工程实现三重人格模拟
  * 基于规则的决策汇总机制
  * 由于系统需要同时并发请求三个模型实例，不支持OpenRouter等免费/共享配额的API服务

### 关于项目

本项目是一个基于大型语言模型（LLM）实现的《新世纪福音战士》(Neon Genesis Evangelion) 中的 **MAGI 超级计算机系统** 的概念模拟器。

**在线演示:** [https://magi.ai123.win/](https://magi.ai123.win/)

在《EVA》的世界观中，MAGI系统并非单一主机，而是由三台移植了不同人格侧面的生物计算机组成：



* **Melchior-1 (科学家):** 代表纯粹的逻辑与数据分析。
* **Balthasar-2 (母亲):** 代表伦理、责任与长远战略。
* **Casper-3 (女人):** 代表情感、直觉与复杂人性。

该项目通过为大型语言模型（LLM）注入精心设计的"角色扮演提示词"，模拟这三个人格，使用户能够提交一个议案，并从三个截然不同的维度获得分析结果，最终通过"少数服从多数"的原则得出结论。


### 目标



* **探索决策制定:** 将一个复杂问题分解为逻辑、伦理和情感三个层面，为我们提供一种新颖的决策辅助视角。
* **致敬经典:** 将经典的科幻设定通过前沿技术带入现实，感受其设计的精妙之处。
* **技术实践:** 探索大型语言模型在复杂角色扮演和多角度问题解决上的潜力。

### 功能特点

* **三贤人决策系统:** 模拟MAGI系统的三重人格决策机制，提供多维度分析。
* **多模型支持:** 兼容多种大型语言模型API，包括OpenAI、Anthropic Claude等，用户可自由选择。
* **历史记录管理:** 
  * 可折叠式历史面板，方便查看和管理过往的决策记录
  * 自动保存所有决策历史，支持详细查看每次决策的完整过程
  * 支持清空历史记录功能
* **API密钥安全存储:** 用户API密钥安全存储在本地，不会上传至服务器。
* **直观的用户界面:** 还原EVA动画中的MAGI界面风格，提供沉浸式体验。
* **响应式设计:** 适应不同屏幕尺寸，保持良好的可用性。
* **音效反馈:** 模拟原作中的系统音效，增强用户体验。


## English


### Technical Architecture

This project employs a frontend-backend separated architecture:

* **Frontend Technologies:**
  * Interactive interface built with React and Dash framework
  * Pure CSS animations and transitions
  * Configuration and history management using localStorage
  * Native JavaScript audio system

* **Backend Technologies:**
  * Python Flask for API services
  * Asynchronous processing for parallel AI model requests
  * Secure API key management and request forwarding
  * Persistent storage for history records

* **AI Integration:**
  * Support for multiple LLMs including OpenAI, Anthropic Claude
  * Custom prompt engineering for triple personality simulation
  * Rule-based decision aggregation mechanism
  * Due to concurrent requests to three model instances, OpenRouter and other free/shared quota API services are not supported

### About the Project

This project is a conceptual simulator of the **MAGI Supercomputer System** from "Neon Genesis Evangelion," implemented using Large Language Models (LLMs).

**Live Demo:** [https://magi.ai123.win/](https://magi.ai123.win/)

In the world of *EVA*, the MAGI system is not a single mainframe but a trinity of bio-computers, each transplanted with a different facet of a personality:



* **Melchior-1 (The Scientist):** Represents pure logic and data analysis.
* **Balthasar-2 (The Mother):** Represents ethics, responsibility, and long-term strategy.
* **Casper-3 (The Woman):** Represents emotion, intuition, and complex humanity.

By injecting carefully designed "role-playing prompts" into an LLM, this project simulates these three personalities. It allows users to submit a proposal, receive analyses from three distinct dimensions, and reach a final conclusion based on a majority vote.


### Goals



* **Explore Decision-Making:** Deconstruct a complex problem into layers of logic, ethics, and emotion, offering a novel perspective on decision support.
* **Tribute to a Classic:** Bring a classic sci-fi concept to life with cutting-edge technology and appreciate its brilliant design.
* **Technical Practice:** Explore the potential of LLMs in complex role-playing and multi-faceted problem-solving.

### Features

* **Three Wise Men Decision System:** Simulates the MAGI system's triple personality decision mechanism, providing multi-dimensional analysis.
* **Multi-Model Support:** Compatible with various LLM APIs including OpenAI, Anthropic Claude, and more, allowing users to choose their preferred model.
* **History Management:** 
  * Collapsible history panel for easy access and management of past decisions
  * Automatic saving of all decision histories with detailed view of each decision process
  * Support for clearing history records
* **API Key Security:** User API keys are securely stored locally and never uploaded to servers.
* **Intuitive User Interface:** Recreates the MAGI interface style from the EVA anime for an immersive experience.
* **Responsive Design:** Adapts to different screen sizes while maintaining good usability.
* **Audio Feedback:** Simulates system sounds from the original work to enhance user experience.