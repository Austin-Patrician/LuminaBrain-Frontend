<div align="center"> 
<br> 
<br>
<img src="./src/assets/images/logo.png" height="140" />
<h3> Slash Admin </h3>
  <p>
    <p style="font-size: 14px">
      Slash Admin 是一款现代化的后台管理模板，基于 React 18、Vite、Ant Design 5 和 TypeScript 构建。它旨在帮助开发人员快速搭建功能强大的后台管理系统。
    </p>
    <br />
    <br />
    <a href="https://admin.slashspaces.com/">在线预览</a>
    ·
    <a href="https://discord.gg/fXemAXVNDa">Discord</a>
    ·
    <a href="https://docs-admin.slashspaces.com/">文档</a>
    <br />
    <br />
    <a href="https://trendshift.io/repositories/6387" target="_blank"><img src="https://trendshift.io/api/badge/repositories/6387" alt="d3george%2Fslash-admin | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</div>

**中文** | [English](./README.md)

## 赞助 
<div style="display: flex; gap: 50px"> 
  <img style="width:300px" src="https://d3george.github.io/github-static/pay/weixin.jpg" >
  <img style="width:280px" src="https://d3george.github.io/github-static/pay/buymeacoffee.png" />
</div>

## 在线预览
+ https://admin.slashspaces.com/

|![login.png](https://d3george.github.io/github-static/slash-admin/login.jpeg)|![login_dark.png](https://d3george.github.io/github-static/slash-admin/login_dark.jpeg)
| ----------------------------------------------------------------- | ------------------------------------------------------------------- |
|![analysis.png](https://d3george.github.io/github-static/slash-admin/analysis.png)|![workbench.png](https://d3george.github.io/github-static/slash-admin/workbench.png)

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5 + Rollup
- **UI 组件库**: Ant Design 5 + Ant Design X
- **样式方案**: TailwindCSS 4 + Vanilla Extract + Styled Components
- **状态管理**: Zustand
- **数据请求**: TanStack Query (React Query)
- **路由管理**: React Router 7
- **国际化**: i18next + react-i18next
- **图标库**: Iconify + Lucide React + React Icons
- **图表库**: ApexCharts + React ApexCharts
- **编辑器**: React Quill
- **拖拽排序**: DND Kit
- **流程图**: XYFlow React
- **日历组件**: FullCalendar
- **代码高亮**: Highlight.js + React Syntax Highlighter
- **Markdown**: React Markdown + Remark + Rehype
- **动画库**: Framer Motion
- **工具库**: Ramda + Day.js + Numeral.js
- **开发工具**: Biome + Lefthook + CommitLint

## 主要特性

- 🚀 **现代化技术栈**: 基于 React 18 hooks 和最新的前端技术构建
- ⚡ **极速开发体验**: Vite 5 提供快速的开发服务器和热模块替换
- 🎨 **丰富的 UI 组件**: 集成 Ant Design 5，提供完整的设计语言和组件库
- 🔒 **类型安全**: 完全使用 TypeScript 开发，提供完整的类型提示和检查
- 📱 **响应式设计**: 适配各种屏幕尺寸和设备，支持移动端访问
- 🛣️ **灵活路由**: 支持多级嵌套路由和动态路由配置
- 👥 **权限管理**: 基于角色的访问控制系统，精细化权限管理
- 🌍 **国际化支持**: 内置多语言切换，支持中英文等多种语言
- 🎯 **完整的管理功能**: 包含用户管理、角色管理、权限管理等常见后台功能
- 🎭 **主题定制**: 支持深色/浅色主题切换和自定义主题配置
- 🔄 **Mock 数据**: 基于 MSW 和 Faker.js 的完整 Mock 方案
- 📊 **数据可视化**: 集成 ApexCharts 提供丰富的图表组件
- 🔍 **代码质量**: 使用 Biome 进行代码格式化和 Lint 检查
- 📝 **Git 规范**: 集成 CommitLint 和 Lefthook 确保代码提交规范
- 🐳 **容器化部署**: 提供 Docker 和 Docker Compose 部署方案

## 环境要求

- **Node.js**: 20.x 或更高版本
- **包管理器**: pnpm 9.1.0 或更高版本

## 快速开始

### 获取项目代码

```bash
git clone https://github.com/d3george/slash-admin.git
cd slash-admin
```

### 安装依赖

在项目根目录下运行以下命令安装项目依赖：

```bash
pnpm install
```

### 启动开发服务器

运行以下命令以启动开发服务器：

```bash
pnpm dev
```

访问 [http://localhost:3001](http://localhost:3001) 查看您的应用程序。

### 构建生产版本

运行以下命令以构建生产版本：

```bash
pnpm build
```

构建后的文件将位于 `dist` 目录中。

### 预览生产构建

```bash
pnpm preview
```

## 容器化部署

### 使用 Docker

#### 构建镜像
在终端中进入项目根目录，并执行以下命令来构建 Docker 镜像:
```bash
docker build -t slash-admin .
```

#### 运行容器
使用以下命令在 Docker 容器中运行你的应用：
```bash
docker run -p 3001:80 slash-admin
```
这将在容器的端口 `80` (暴露在`Dockerfile`中) 上运行你的应用，并将其映射到你主机的端口 `3001` 上。

现在，你可以通过访问 http://localhost:3001 来查看部署的应用。

### 使用 Docker Compose

在终端中进入项目根目录，并执行以下命令来启动 Docker Compose：
```bash
docker-compose up -d
```
Docker Compose 根据`docker-compose.yaml`定义的配置构建镜像并在后台运行容器。

容器运行成功后，同样可以通过访问 http://localhost:3001 来查看部署的应用。

## 项目结构

```
slash-admin/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   │   ├── apiClient.ts   # API 客户端配置
│   │   └── services/      # 各模块服务
│   ├── assets/            # 资源文件
│   │   ├── icons/         # 图标文件
│   │   └── images/        # 图片文件
│   ├── components/        # 通用组件
│   │   ├── animate/       # 动画组件
│   │   ├── chart/         # 图表组件
│   │   ├── editor/        # 编辑器组件
│   │   └── ...
│   ├── hooks/             # 自定义 Hooks
│   ├── layouts/           # 布局组件
│   ├── locales/           # 国际化文件
│   ├── pages/             # 页面组件
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── styles/            # 样式文件
│   ├── theme/             # 主题配置
│   ├── types/             # 类型定义
│   └── utils/             # 工具函数
├── types/                 # 全局类型定义
├── package.json
├── vite.config.ts         # Vite 配置
├── tailwind.config.ts     # TailwindCSS 配置
├── tsconfig.json          # TypeScript 配置
└── biome.json            # Biome 配置
```

## 开发规范

### Git 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，参考 [.commitlint.config.js](./commitlint.config.js)

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式化（不影响代码运行的变动）
- `refactor`: 代码重构
- `perf`: 性能优化
- `revert`: 回滚提交
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: 修改 CI 配置、脚本
- `types`: 类型定义文件修改
- `wip`: 开发中

### 代码规范

项目使用 [Biome](https://biomejs.dev/) 进行代码格式化和 Lint 检查：

```bash
# 格式化代码
pnpm biome format --write .

# Lint 检查
pnpm biome check .

# 自动修复
pnpm biome check --apply .
```

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

在提交 PR 之前，请确保：

1. 代码通过 Biome 检查
2. 提交信息符合 Conventional Commits 规范
3. 包含必要的测试和文档更新

## 许可证

本项目基于 [MIT](./LICENSE) 许可证开源。

## 联系我们

- 💬 [Discord](https://discord.gg/fXemAXVNDa)
- 📧 [GitHub Issues](https://github.com/d3george/slash-admin/issues)
- 📖 [在线文档](https://docs-admin.slashspaces.com/)

---

如果这个项目对你有帮助，请给个 ⭐️ 支持一下！
