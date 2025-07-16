# Tutu Studio 项目结构分析

## 项目概述

Tutu Studio 是一个跨平台的桌面AI助手应用，支持多种LLM提供商，基于Electron + React + TypeScript技术栈构建。

## 技术栈

### 核心技术
- **框架**: Electron 35.6.0 (桌面应用框架)
- **前端**: React 19.0.0 + TypeScript 5.6.2
- **构建工具**: Electron Vite 3.1.0 + Vite 6.2.6
- **包管理**: Yarn 4.9.1 (Workspaces)
- **UI库**: Ant Design 5.24.7
- **状态管理**: Redux Toolkit 2.2.5 + React Redux 9.1.2

### 开发工具
- **代码质量**: ESLint + Prettier + Husky
- **测试框架**: Vitest 3.1.4 + Playwright 1.52.0
- **样式**: Styled Components 6.1.11 + Sass 1.88.0
- **编译器**: SWC (React插件)

### AI相关技术
- **LLM SDK**: OpenAI, Anthropic, Google Gemini, Mistral等
- **向量数据库**: LibSQL 0.14.0
- **知识库**: EmbedJS系列组件
- **文档处理**: PDF.js, Office解析, Markdown渲染
- **搜索引擎**: 多种Web搜索提供商集成

## 项目结构

```
tutu-studio/
├── src/                          # 源代码目录
│   ├── main/                     # Electron主进程
│   │   ├── services/             # 主进程服务
│   │   ├── mcpServers/           # MCP服务器
│   │   ├── knowledge/            # 知识库处理
│   │   ├── integration/          # 第三方集成
│   │   └── utils/                # 工具函数
│   ├── preload/                  # 预加载脚本
│   └── renderer/                 # 渲染进程(前端)
│       └── src/
│           ├── aiCore/           # AI核心模块
│           ├── components/       # React组件
│           ├── pages/            # 页面组件
│           ├── services/         # 前端服务
│           ├── store/            # Redux状态管理
│           ├── hooks/            # React Hooks
│           ├── utils/            # 工具函数
│           └── types/            # TypeScript类型定义
├── packages/                     # 共享包
│   └── shared/                   # 共享代码
├── build/                        # 构建资源
├── docs/                         # 文档
├── tests/                        # 测试文件
├── scripts/                      # 构建脚本
└── resources/                    # 静态资源
```

## 核心模块详解

### 1. AI核心模块 (aiCore)

基于中间件架构设计的AI功能核心：

```
aiCore/
├── clients/                      # AI提供商客户端
│   ├── openai/                   # OpenAI客户端
│   ├── gemini/                   # Google Gemini客户端
│   ├── anthropic/                # Anthropic客户端
│   └── BaseApiClient.ts          # 基础客户端接口
├── middleware/                   # 中间件系统
│   ├── common/                   # 通用中间件
│   ├── core/                     # 核心中间件
│   ├── feat/                     # 特性中间件
│   └── builder.ts                # 中间件构建器
└── index.ts                      # AI核心服务入口
```

**设计特点**:
- 统一的API客户端接口，支持多种LLM提供商
- 中间件架构处理请求/响应流
- 支持流式处理和实时回调
- 标准化的Chunk类型系统

### 2. 主进程服务 (src/main/services)

```
services/
├── AppService.ts                 # 应用核心服务
├── WindowService.ts              # 窗口管理
├── FileSystemService.ts          # 文件系统
├── KnowledgeService.ts           # 知识库服务
├── MCPService.ts                 # MCP协议服务
├── BackupManager.ts              # 备份管理
├── ProxyManager.ts               # 代理管理
└── ...
```

### 3. 前端页面结构 (src/renderer/src/pages)

```
pages/
├── home/                         # 主页/对话页面
├── agents/                       # AI助手管理
├── knowledge/                    # 知识库管理
├── settings/                     # 设置页面
├── files/                        # 文件管理
├── paintings/                    # 图像生成
├── translate/                    # 翻译功能
└── memory/                       # 记忆系统
```

### 4. 状态管理 (src/renderer/src/store)

使用Redux Toolkit进行状态管理：

```
store/
├── index.ts                      # Store配置
├── assistants.ts                 # 助手状态
├── knowledge.ts                  # 知识库状态
├── settings.ts                   # 设置状态
├── llm.ts                        # LLM配置状态
├── memory.ts                     # 记忆状态
└── ...
```

## 工作流程

### 开发流程

1. **环境准备**
   ```bash
   # 安装Node.js 20.x
   # 启用Corepack
   corepack enable
   corepack prepare yarn@4.6.0 --activate

   # 安装依赖
   yarn install
   ```

2. **开发模式**
   ```bash
   yarn dev          # 启动开发服务器
   yarn debug        # 调试模式
   yarn test         # 运行测试
   yarn test:e2e     # 端到端测试
   ```

3. **代码质量检查**
   ```bash
   yarn lint         # ESLint检查
   yarn format       # Prettier格式化
   yarn typecheck    # TypeScript类型检查
   yarn check:i18n   # 国际化检查
   ```

### 构建流程

1. **预构建检查**
   ```bash
   yarn build:check  # 完整检查(类型+i18n+测试)
   ```

2. **平台构建**
   ```bash
   yarn build:win    # Windows构建
   yarn build:mac    # macOS构建
   yarn build:linux  # Linux构建
   ```

### CI/CD流程

1. **Pull Request CI** (`.github/workflows/pr-ci.yml`)
   - 代码检查 (ESLint)
   - 类型检查 (TypeScript)
   - 单元测试 (Vitest)
   - 构建验证

2. **发布流程** (`.github/workflows/release.yml`)
   - 自动版本管理
   - 多平台构建
   - 自动发布到GitHub Releases

3. **夜间构建** (`.github/workflows/nightly-build.yml`)
   - 定期构建最新版本
   - 提供预览版本

## 特色功能

### 1. 多LLM提供商支持
- 云服务: OpenAI, Gemini, Anthropic, Mistral等
- 本地模型: Ollama, LM Studio
- Web服务: Claude, Perplexity, Poe等

### 2. 知识库系统
- 多格式文档支持 (PDF, Office, Markdown等)
- 向量化存储和检索
- WebDAV同步支持

### 3. MCP (Model Context Protocol)
- 标准化的模型上下文协议
- 插件化扩展支持
- 工具调用集成

### 4. 多窗口支持
- 主窗口: 完整功能界面
- 迷你窗口: 快速对话
- 选择助手: 文本选择增强
- 选择工具栏: 快捷操作

## 开发建议

### 推荐IDE配置
- **编辑器**: Cursor + ESLint + Prettier插件
- **调试**: Chrome DevTools集成
- **测试**: Vitest UI界面

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint规则
- 组件采用函数式编程
- 使用Styled Components进行样式管理

### 测试策略
- 单元测试: Vitest + Testing Library
- 端到端测试: Playwright
- 覆盖率要求: 通过CI检查

这个项目展现了现代桌面应用开发的最佳实践，特别是在AI应用领域的架构设计和工程化方面。
