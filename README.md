# LuminaBrain 🧠

An intelligent AI platform built with modern web technologies, providing comprehensive AI model management, knowledge base operations, and conversational AI capabilities.

![LuminaBrain](https://img.shields.io/badge/LuminaBrain-AI%20Platform-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.22.1-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.11-green)

## ✨ Features

### 🤖 AI Chat & Conversation
- **Multi-Model Support**: Support for various AI models (ChatGPT, Claude, etc.)
- **Real-time Streaming**: Support for both streaming and non-streaming responses
- **Context Management**: Intelligent conversation history and context preservation
- **File Attachments**: Upload and process various file formats
- **Thinking Mode**: Visual representation of AI thinking process

### 📚 Knowledge Management
- **Knowledge Base Creation**: Create and manage knowledge repositories
- **Multi-format Import**: Support for PDF, Word, Excel, text, and web links
- **QA Processing**: Specialized Q&A format support with templates
- **OCR Support**: Optical Character Recognition for image-based content
- **Rerank Models**: Advanced search ranking with rerank model integration

### 🔧 AI Model Management
- **Model Configuration**: Manage chat, embedding, and rerank models
- **Provider Integration**: Support for multiple AI providers
- **Model Type Classification**: Organized model management by type
- **Dynamic Loading**: Real-time model availability and configuration

### 🛠 Agent & Application Management
- **AI Agents**: Create and manage specialized AI agents
- **Application Types**: Support for chat, Text2SQL, and custom applications
- **Flow Management**: Visual workflow design and execution
- **Integration Ready**: API-first design for easy integration

### 👥 User & Permission System
- **Role-based Access**: Comprehensive RBAC system
- **Organization Management**: Multi-tenant organization support
- **Permission Control**: Granular permission management
- **User Profiles**: Complete user management system

### 📊 Analytics & Monitoring
- **Dashboard**: Real-time analytics and metrics
- **Usage Statistics**: Detailed usage tracking and reporting
- **Performance Monitoring**: System performance insights
- **Audit Logs**: Comprehensive activity logging

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 20.x
- **pnpm**: >= 9.1.0 (recommended package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/d3george/slash-admin.git
cd slash-admin

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Environment Configuration

Create environment files based on your deployment:

```bash
# Development
cp .env.development .env.local

# Production
cp .env.production .env.local
```

Configure the following environment variables:

```env
# API Configuration
VITE_APP_BASE_API=http://localhost:8080/api
VITE_APP_HOMEPAGE=/dashboard/workbench
VITE_APP_BASE_PATH=/

# Router Mode
VITE_APP_ROUTER_MODE=permission

# Environment
VITE_APP_ENV=development
```

## 🏗 Project Structure

```
src/
├── api/                    # API services and client configuration
│   ├── apiClient.ts       # Axios configuration and interceptors
│   └── services/          # Domain-specific API services
├── components/            # Reusable UI components
│   ├── animate/          # Animation components
│   ├── chart/            # Chart components
│   ├── editor/           # Rich text editor
│   ├── icon/             # Icon components
│   └── ...
├── layouts/              # Layout components
│   ├── dashboard/        # Dashboard layout
│   └── simple/           # Simple layout
├── pages/                # Feature pages
│   ├── Chat/            # AI conversation interface
│   ├── knowledge/       # Knowledge base management
│   ├── agent/           # AI agent management
│   ├── application/     # Application management
│   ├── management/      # System management
│   └── ...
├── router/               # Routing configuration
│   ├── routes/          # Route definitions
│   └── hooks/           # Router hooks
├── store/                # State management (Zustand)
├── theme/                # Theme system and styling
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 🎨 Tech Stack

### Frontend Framework
- **React 18.2.0**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and enhanced development experience
- **Vite**: Lightning-fast build tool and development server

### UI & Styling
- **Ant Design 5.22.1**: Enterprise-class UI design language
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Production-ready motion library
- **Vanilla Extract**: Zero-runtime CSS-in-JS

### State Management & Data
- **Zustand**: Lightweight state management
- **TanStack React Query**: Powerful data synchronization
- **React Router**: Declarative routing

### Development Tools
- **Biome**: Fast formatter and linter
- **Lefthook**: Git hooks management
- **Commitlint**: Conventional commit enforcement

## 📖 Usage Guide

### Creating a Knowledge Base

1. Navigate to **Knowledge Management**
2. Click **"New"** button
3. Configure basic information:
   - Name and description
   - Select chat and embedding models
   - Optionally configure rerank model
   - Enable OCR if needed
4. Set advanced token configurations
5. Click **"Create Knowledge Base"**

### Importing Knowledge Content

1. Open your knowledge base
2. Click **"Import"** dropdown
3. Choose import type:
   - **File Import**: PDF, Word, Excel, PPT, etc.
   - **Link Import**: Web pages and articles
   - **Text Import**: Direct text input
   - **QA Import**: Structured Q&A data
4. Configure processing options
5. Upload and process content

### Starting an AI Conversation

1. Go to **Chat** interface
2. Select an AI model from the dropdown
3. Optionally enable **Thinking Mode**
4. Attach files if needed
5. Type your message and click **Send**

### Managing AI Agents

1. Access **Agent Management**
2. Create new agent with specific instructions
3. Configure model parameters
4. Set function choices and behaviors
5. Test and deploy agent

## 🔧 Configuration

### Permission System

The system uses a comprehensive RBAC (Role-Based Access Control) model:

- **Roles**: Define user roles with specific permissions
- **Permissions**: Granular access control for features
- **Organizations**: Multi-tenant support

## 🚢 Deployment

### Build for Production

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview
```

### Docker Deployment

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

### Environment Variables for Production

```env
VITE_APP_BASE_API=https://your-api-domain.com
VITE_APP_ENV=production
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Submit a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Build process or auxiliary tool changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- 📧 Email: support@luminabrain.com
- 💬 Discord: [Join our community](https://discord.gg/luminabrain)
- 📖 Documentation: [docs.luminabrain.com](https://docs.luminabrain.com)
- 🐛 Issues: [GitHub Issues](https://github.com/d3george/slash-admin/issues)

## 🗺 Roadmap

- [ ] **Multi-language Support**: Internationalization for global users
- [ ] **Mobile App**: React Native mobile application
- [ ] **API Documentation**: Comprehensive API documentation
- [ ] **Plugin System**: Extensible plugin architecture
- [ ] **Advanced Analytics**: Enhanced analytics and reporting
- [ ] **Cloud Integration**: Native cloud service integrations

## 🌟 Acknowledgments

- [Ant Design](https://ant.design/) for the excellent UI components
- [React](https://reactjs.org/) for the powerful frontend framework
- [Vite](https://vitejs.dev/) for the blazing fast build tool
- All contributors who help make this project better

## Star History

![Star History Chart](https://api.star-history.com/svg?repos=Austin-Patrician/LuminaBrain-Frontend&type=Date)

---

**Made with ❤️ by the LuminaBrain Team**

[![Follow us on GitHub](https://img.shields.io/github/followers/Austin-Patrician?style=social)](https://github.com/Austin-Patrician)
[![Star this repo](https://img.shields.io/github/stars/Austin-Patrician/LuminaBrain-Frontend?style=social)](https://github.com/Austin-Patrician/LuminaBrain-Frontend/stargazers)
