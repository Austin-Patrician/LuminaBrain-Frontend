# AI模型和知识库选择器功能实现

## 完成的功能

### 1. API 端点和类型定义

在 `types/entity.ts` 中添加了新的类型定义：
```typescript
// AI模型和知识库项
export interface AiModelAndKnowledgeItem {
  id: string;
  label: string;
  type: "AI Model" | "Knowledge";
}

// AI模型和知识库列表响应类型
export interface AiModelsAndKnowledgesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AiModelAndKnowledgeItem[];
}
```

### 2. API 服务方法

在 `src/api/services/aimodelService.ts` 中添加了新的API方法：
```typescript
// 获取AI模型和知识库列表
getAiModelsAndKnowledges: () => {
  return apiClient.get<AiModelsAndKnowledgesResponse>({
    url: AIModelApi.GetAiModelsAndKnowledges, // "/api/v1/aiModel/aiModelsAndKnowledges"
  });
},
```

### 3. ModelSelector 组件升级

升级了 `src/pages/Chat/components/ModelSelector.tsx` 组件，支持：

#### 3.1 新的API数据结构
- 自动从 `/api/v1/aiModel/aiModelsAndKnowledges` 获取数据
- 按类型分组（AI模型 vs 知识库）
- 两级分组展示

#### 3.2 向后兼容
- 保持对原有 `options` 属性的支持
- 通过 `useNewApi` 属性控制使用新API还是旧的静态数据

#### 3.3 用户体验
- 加载状态指示
- 错误处理和用户提示
- 中文本地化支持

### 4. Chat页面集成

修改了 `src/pages/Chat/index.tsx`：
- 启用新的API模式：`useNewApi={true}`
- 移除了静态的 `modelOptions` 配置
- 自动从API获取最新的模型和知识库列表

### 5. 数据分组展示

新的ModelSelector会按以下方式分组展示：

```
┌─ AI 模型
│  ├─ OpenAI _ gpt-4o
│  ├─ OpenAI _ o3
│  ├─ OpenAI _ o4-mini-high
│  └─ ...
└─ 知识库
   ├─ austintest
   └─ ...
```

## API 响应格式

期望的API响应格式：
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "784aa44f602c4786a08ff9f968ea8237",
      "label": "OpenAI _ gpt-4o",
      "type": "AI Model"
    },
    {
      "id": "3359358875754a159efbad727b6dec7b",
      "label": "austintest",
      "type": "Knowledge"
    }
  ]
}
```

## 使用方法

### 在Chat页面中使用（已集成）
```tsx
<ModelSelector
  value={selectedModel}
  onChange={setSelectedModel}
  useNewApi={true}
/>
```

### 在其他页面中使用（向后兼容）
```tsx
<ModelSelector
  value={selectedModel}
  onChange={setSelectedModel}
  options={staticOptions}
  useNewApi={false}
/>
```

## 测试

创建了测试组件 `src/components/TestModelSelector.tsx`，可以在分析页面中查看功能演示。

## 下一步

1. 确保后端API `GET /api/v1/aiModel/aiModelsAndKnowledges` 正常工作
2. 测试组件在真实环境中的表现
3. 根据需要调整样式和交互体验
