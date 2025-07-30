# LuminaBrain 🧠

基于现代Web技术构建的智能AI平台，提供全面的AI模型管理、知识库操作和对话AI功能。

![LuminaBrain](https://img.shields.io/badge/LuminaBrain-AI%20Platform-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.22.1-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.11-green)

[English](./README.md) | 简体中文

## ✨ 功能特性

### 🤖 AI 对话与交互
- **多模型支持**：支持各种AI模型（ChatGPT、Claude等）
- **实时流式输出**：支持流式和非流式响应模式
- **上下文管理**：智能对话历史和上下文保持
- **文件附件**：上传和处理多种文件格式
- **思考模式**：可视化AI思考过程

### 📚 知识库管理
- **知识库创建**：创建和管理知识仓库
- **多格式导入**：支持PDF、Word、Excel、文本和网页链接
- **QA处理**：专业的问答格式支持和模板
- **OCR支持**：图像内容的光学字符识别
- **重排模型**：高级搜索排序与重排模型集成

### 🔧 AI 模型管理
- **模型配置**：管理聊天、嵌入和重排模型
- **提供商集成**：支持多个AI提供商
- **模型类型分类**：按类型组织的模型管理
- **动态加载**：实时模型可用性和配置

### 🛠 智能体与应用管理
- **AI智能体**：创建和管理专业化AI智能体
- **应用类型**：支持聊天、Text2SQL和自定义应用
- **流程管理**：可视化工作流设计和执行
- **集成就绪**：API优先设计，易于集成

### 👥 用户与权限系统
- **基于角色的访问**：综合RBAC系统
- **组织管理**：多租户组织支持
- **权限控制**：细粒度权限管理
- **用户档案**：完整的用户管理系统

### 📊 分析与监控
- **仪表板**：实时分析和指标
- **使用统计**：详细的使用跟踪和报告
- **性能监控**：系统性能洞察
- **审计日志**：全面的活动日志记录

## 🚀 快速开始

### 系统要求

- **Node.js**：>= 20.x
- **pnpm**：>= 9.1.0（推荐的包管理器）

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/d3george/slash-admin.git
cd slash-admin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 环境配置

根据部署环境创建环境文件：

```bash
# 开发环境
cp .env.development .env.local

# 生产环境
cp .env.production .env.local
```

配置以下环境变量：

```env
# API 配置
VITE_APP_BASE_API=http://localhost:8080/api
VITE_APP_HOMEPAGE=/dashboard/workbench
VITE_APP_BASE_PATH=/

# 路由模式
VITE_APP_ROUTER_MODE=permission

# 环境类型
VITE_APP_ENV=development
```

## 🏗 项目结构

```
src/
├── api/                    # API服务和客户端配置
│   ├── apiClient.ts       # Axios配置和拦截器
│   └── services/          # 领域特定的API服务
├── components/            # 可复用UI组件
│   ├── animate/          # 动画组件
│   ├── chart/            # 图表组件
│   ├── editor/           # 富文本编辑器
│   ├── icon/             # 图标组件
│   └── ...
├── layouts/              # 布局组件
│   ├── dashboard/        # 仪表板布局
│   └── simple/           # 简单布局
├── pages/                # 功能页面
│   ├── Chat/            # AI对话界面
│   ├── knowledge/       # 知识库管理
│   ├── agent/           # AI智能体管理
│   ├── application/     # 应用管理
│   ├── management/      # 系统管理
│   └── ...
├── router/               # 路由配置
│   ├── routes/          # 路由定义
│   └── hooks/           # 路由钩子
├── store/                # 状态管理（Zustand）
├── theme/                # 主题系统和样式
├── types/                # TypeScript类型定义
└── utils/                # 工具函数
```

## 🎨 技术栈

### 前端框架
- **React 18.2.0**：现代React与hooks和并发功能
- **TypeScript**：完整的类型安全和增强的开发体验
- **Vite**：闪电般快速的构建工具和开发服务器

### UI 与样式
- **Ant Design 5.22.1**：企业级UI设计语言
- **Tailwind CSS**：实用优先的CSS框架
- **Framer Motion**：生产就绪的动画库
- **Vanilla Extract**：零运行时CSS-in-JS

### 状态管理与数据
- **Zustand**：轻量级状态管理
- **TanStack React Query**：强大的数据同步
- **React Router**：声明式路由

### 开发工具
- **Biome**：快速格式化器和linter
- **Lefthook**：Git钩子管理
- **Commitlint**：约定式提交强制执行

## 📖 使用指南

### 创建知识库

1. 导航到**知识库管理**
2. 点击**"新建"**按钮
3. 配置基本信息：
   - 名称和描述
   - 选择聊天和嵌入模型
   - 可选配置重排模型
   - 根据需要启用OCR
4. 设置高级令牌配置
5. 点击**"创建知识库"**

### 导入知识内容

1. 打开您的知识库
2. 点击**"导入"**下拉菜单
3. 选择导入类型：
   - **文件导入**：PDF、Word、Excel、PPT等
   - **链接导入**：网页和文章
   - **文本导入**：直接文本输入
   - **QA导入**：结构化问答数据
4. 配置处理选项
5. 上传和处理内容

### 开始AI对话

1. 转到**聊天**界面
2. 从下拉菜单选择AI模型
3. 可选启用**思考模式**
4. 如需要可附加文件
5. 输入消息并点击**发送**

### 管理AI智能体

1. 访问**智能体管理**
2. 使用特定指令创建新智能体
3. 配置模型参数
4. 设置功能选择和行为
5. 测试和部署智能体

## 🔧 配置说明


### 权限系统

系统使用全面的RBAC（基于角色的访问控制）模型：

- **角色**：定义具有特定权限的用户角色
- **权限**：功能的细粒度访问控制
- **组织**：多租户支持

## 🚢 部署

### 生产构建

```bash
# 构建应用程序
pnpm build

# 预览生产构建
pnpm preview
```

### Docker 部署

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "preview"]
```

### 生产环境变量

```env
VITE_APP_BASE_API=https://your-api-domain.com
VITE_APP_ENV=production
```

## 🤝 贡献

我们欢迎贡献！详情请查看我们的[贡献指南](CONTRIBUTING.md)。

### 开发工作流

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'feat: add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交Pull Request

### 提交约定

我们使用[约定式提交](https://www.conventionalcommits.org/zh-hans/)：

- `feat`：新功能
- `fix`：错误修复
- `docs`：文档更改
- `style`：代码样式更改
- `refactor`：代码重构
- `test`：测试添加或修改
- `chore`：构建过程或辅助工具更改

## 📄 许可证

本项目基于MIT许可证 - 详情请查看[LICENSE](LICENSE)文件。

## 🙋‍♂️ 支持

- 📧 邮箱：support@luminabrain.com
- 💬 Discord：[加入我们的社区](https://discord.gg/luminabrain)
- 📖 文档：[docs.luminabrain.com](https://docs.luminabrain.com)
- 🐛 问题：[GitHub Issues](https://github.com/d3george/slash-admin/issues)

## 🗺 路线图

- [ ] **多语言支持**：面向全球用户的国际化
- [ ] **移动应用**：React Native移动应用程序
- [ ] **API文档**：全面的API文档
- [ ] **插件系统**：可扩展的插件架构
- [ ] **高级分析**：增强的分析和报告
- [ ] **云集成**：原生云服务集成

## 🌟 致谢

- [Ant Design](https://ant.design/) 提供出色的UI组件
- [React](https://reactjs.org/) 提供强大的前端框架
- [Vite](https://vitejs.dev/) 提供极速构建工具
- 所有帮助改进项目的贡献者

## 📱 截图

### 聊天界面
智能对话界面，支持多模型切换和实时流式输出

### 知识库管理
完整的知识库创建、导入和管理功能

### 智能体管理
专业的AI智能体配置和部署

### 仪表板
实时数据分析和系统监控

## ⚡ 性能特性

- **快速启动**：基于Vite的极速开发体验
- **代码分割**：自动代码分割和懒加载
- **缓存优化**：智能缓存策略提升性能
- **响应式设计**：完美适配各种设备
- **SEO友好**：服务端渲染支持

## Star 历史

![Star History Chart](https://api.star-history.com/svg?repos=Austin-Patrician/LuminaBrain-Frontend&type=Date)

---

**由 LuminaBrain 团队用 ❤️ 制作**

[![在GitHub上关注我们](https://img.shields.io/github/followers/d3george?style=social&label=关注)](https://github.com/d3george)
[![为此仓库点星](https://img.shields.io/github/stars/d3george/slash-admin?style=social&label=点星)](https://github.com/d3george/slash-admin/stargazers)
