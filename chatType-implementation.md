# Chat服务chatType参数传递功能实现

## 完成的功能

### 1. ChatService修改

在 `src/api/services/chatService.ts` 中：

#### 1.1 接口定义更新
```typescript
// OpenAI兼容的聊天请求格式
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  chatType?: string; // 新增：模型类型
}
```

#### 1.2 便捷方法更新
```typescript
export const sendMessage = async (
  messages: ChatMessage[],
  model: string = 'gpt-4.1',
  streaming: boolean = true,
  chatType?: string // 新增：模型类型参数
): Promise<string> => {
  const request: ChatCompletionRequest = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 8000,
    ...(chatType && { chatType }), // 如果有chatType则添加到请求中
  };
  // ...rest of the function
}
```

### 2. ModelSelector组件升级

在 `src/pages/Chat/components/ModelSelector.tsx` 中：

#### 2.1 接口定义更新
```typescript
interface ModelSelectorProps {
  value: string;
  onChange: (value: string, type?: string) => void; // 修改：增加类型参数
  options?: ModelOption[]; // 保持向后兼容
  useNewApi?: boolean; // 新增：是否使用新的API
}
```

#### 2.2 处理选择变化
```typescript
// 处理选择变化，找到对应的类型信息
const handleChange = (selectedValue: string) => {
  if (useNewApi) {
    const selectedItem = apiOptions.find(item => item.id === selectedValue);
    onChange(selectedValue, selectedItem?.type);
  } else {
    onChange(selectedValue);
  }
};

// 处理旧API的选择变化
const handleOldChange = (selectedValue: string) => {
  onChange(selectedValue);
};
```

### 3. Chat页面集成

在 `src/pages/Chat/index.tsx` 中：

#### 3.1 状态管理
```typescript
const [selectedModel, setSelectedModel] = useState('gpt-4.1');
const [selectedModelType, setSelectedModelType] = useState<string>(''); // 新增：存储模型类型
```

#### 3.2 模型选择处理
```typescript
// 处理模型选择变化
const handleModelChange = useCallback((modelId: string, modelType?: string) => {
  setSelectedModel(modelId);
  if (modelType) {
    setSelectedModelType(modelType);
  }
}, []);
```

#### 3.3 API调用更新
在所有三个`createStreamingChatCompletion`调用中都添加了chatType参数：

```typescript
await chatService.createStreamingChatCompletion(
  {
    model: selectedModel,
    messages: apiMessages,
    temperature: 0.7,
    max_tokens: 2048,
    ...(selectedModelType && { chatType: selectedModelType }), // 添加chatType参数
  },
  // ...callbacks
);
```

### 4. 数据流程

1. **用户选择模型**：在ModelSelector中选择AI模型或知识库
2. **类型信息传递**：ModelSelector调用`handleModelChange(modelId, modelType)`
3. **状态存储**：Chat页面存储选中的模型ID和类型
4. **API请求**：发送消息时将`chatType`参数传递给后台

### 5. API请求格式

现在发送到后台的请求将包含chatType字段：

```json
{
  "model": "784aa44f602c4786a08ff9f968ea8237",
  "messages": [...],
  "temperature": 0.7,
  "max_tokens": 2048,
  "chatType": "AI Model"  // 新增字段
}
```

### 6. 支持的chatType值

根据API返回的数据，支持的类型包括：
- `"AI Model"` - AI模型
- `"Knowledge"` - 知识库

### 7. 向后兼容性

- 保持对原有API结构的完全兼容
- 如果没有选择新的API模式，chatType不会被传递
- 支持旧的静态模型配置方式

## 测试验证

1. 在Chat页面选择不同的AI模型和知识库
2. 发送消息时检查网络请求，确认chatType参数正确传递
3. 验证新API和旧API模式都能正常工作

## 下一步

1. 确保后台正确处理chatType参数
2. 根据chatType值实现不同的处理逻辑
3. 测试完整的聊天流程
