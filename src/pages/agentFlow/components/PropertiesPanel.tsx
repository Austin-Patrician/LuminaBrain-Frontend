import React from "react";
import { Input, Select, Slider, Card, Typography, Tag } from "antd";
import { SettingOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface NodeData {
  label?: string;
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  systemPrompt?: string;
  inputSource?: string;
  fixedInput?: string;
  [key: string]: any;
}

interface Node {
  id: string;
  type: string;
  data: NodeData;
  deletable?: boolean;
}

interface PropertiesPanelProps {
  node: Node | null;
  onChange: (id: string, data: Partial<NodeData>) => void;
}

// 节点类型配置
const NODE_TYPE_CONFIG = {
  aiDialogNode: {
    title: "AI对话节点",
    color: "blue",
    icon: "🤖",
    fields: ["label", "inputSource", "userMessage", "model", "systemPrompt", "temperature", "topP", "maxTokens", "presencePenalty", "frequencyPenalty"]
  },
  aiSummaryNode: {
    title: "摘要总结节点",
    color: "cyan",
    icon: "📝",
    fields: ["label", "model", "temperature", "maxTokens"]
  },
  databaseNode: {
    title: "数据库节点",
    color: "green",
    icon: "🗄️",
    fields: ["label", "connectionString", "query"]
  },
  knowledgeBaseNode: {
    title: "知识库节点",
    color: "purple",
    icon: "📚",
    fields: ["label", "searchQuery", "topK"]
  },
  startNode: {
    title: "开始节点",
    color: "emerald",
    icon: "🚀",
    fields: ["label"]
  },
  endNode: {
    title: "结束节点",
    color: "red",
    icon: "🏁",
    fields: ["label"]
  },
  basicNode: {
    title: "基础节点",
    color: "blue",
    icon: "⚡",
    fields: ["label", "description"]
  },
  processNode: {
    title: "处理节点",
    color: "green",
    icon: "⚙️",
    fields: ["label", "processType", "parameters"]
  },
  decisionNode: {
    title: "判断节点",
    color: "yellow",
    icon: "🔀",
    fields: ["label", "condition", "trueAction", "falseAction"]
  },
  conditionNode: {
    title: "条件节点",
    color: "orange",
    icon: "🎯",
    fields: ["label", "condition", "operator", "value"]
  },
  customNode: {
    title: "自定义节点",
    color: "indigo",
    icon: "🔧",
    fields: ["label", "customCode", "parameters"]
  },
  jsonExtractor: {
    title: "JSON提取器",
    color: "pink",
    icon: "📋",
    fields: ["label", "jsonPath", "outputFormat"]
  },
};

function PropertiesPanel({ node, onChange }: PropertiesPanelProps) {
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <SettingOutlined className="text-4xl mb-4 text-gray-400" />
        <div className="text-lg font-medium mb-2">未选择节点</div>
        <div className="text-sm text-center max-w-xs">
          请在画布中点击一个节点来编辑其属性
        </div>
      </div>
    );
  }

  const config = NODE_TYPE_CONFIG[node.type as keyof typeof NODE_TYPE_CONFIG] || {
    title: "未知节点",
    color: "gray",
    icon: "❓",
    fields: ["label"]
  };

  // AI相关节点类型
  const aiTypes = ["aiDialogNode", "aiSummaryNode", "aiExtractNode", "aiJsonNode"];
  const isAINode = aiTypes.includes(node.type);

  // 处理表单变更
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(node.id, { [field]: e.target.value });
  };

  const handleSelectChange = (field: string) => (value: any) => {
    onChange(node.id, { [field]: value });
  };

  const handleSliderChange = (field: string) => (value: number) => {
    onChange(node.id, { [field]: value });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 节点信息头部 */}
      <div className={`
        p-4 bg-gradient-to-r from-${config.color}-50 to-${config.color}-100 
        border-b border-${config.color}-200 rounded-t-lg
      `}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-xl mr-2">{config.icon}</span>
            <div>
              <div className={`text-lg font-semibold text-${config.color}-800`}>
                {config.title}
              </div>
              <div className="text-sm text-gray-600">ID: {node.id}</div>
            </div>
          </div>
          <Tag color={config.color} className="ml-2">
            {node.type}
          </Tag>
        </div>

        {node.deletable === false && (
          <div className="flex items-center text-xs text-gray-500">
            <InfoCircleOutlined className="mr-1" />
            系统节点，不可删除
          </div>
        )}
      </div>

      {/* 属性表单 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 基础属性 */}
        <Card size="small" title="基础属性" className="shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                节点名称
              </label>
              <Input
                value={node.data.label || ""}
                onChange={handleInputChange('label')}
                placeholder="输入节点名称"
                className="w-full"
              />
            </div>

            {config.fields.includes('description') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述信息
                </label>
                <TextArea
                  rows={2}
                  value={node.data.description || ""}
                  onChange={handleInputChange('description')}
                  placeholder="输入节点描述"
                />
              </div>
            )}
          </div>
        </Card>

        {/* AI模型配置 */}
        {isAINode && (
          <Card size="small" title="AI模型配置" className="shadow-sm">
            <div className="space-y-4">
              {config.fields.includes('inputSource') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    输入来源
                  </label>
                  <Select
                    value={node.data.inputSource || "上一步结果"}
                    onChange={handleSelectChange('inputSource')}
                    className="w-full"
                  >
                    <Option value="上一步结果">上一步结果</Option>
                    <Option value="用户输入">用户输入</Option>
                    <Option value="固定值">固定值</Option>
                    <Option value="混合输入">混合输入</Option>
                  </Select>
                </div>
              )}

              {node.data.inputSource === '固定值' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    固定输入内容
                  </label>
                  <TextArea
                    rows={3}
                    value={node.data.fixedInput || ""}
                    onChange={handleInputChange('fixedInput')}
                    placeholder="输入固定的提示内容..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI模型
                </label>
                <Select
                  value={node.data.model || "gpt-3.5-turbo"}
                  onChange={handleSelectChange('model')}
                  className="w-full"
                >
                  <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
                  <Option value="gpt-4">GPT-4</Option>
                  <Option value="gpt-4-turbo">GPT-4 Turbo</Option>
                  <Option value="claude-3-opus">Claude 3 Opus</Option>
                  <Option value="claude-3-sonnet">Claude 3 Sonnet</Option>
                  <Option value="llama-3">Llama 3</Option>
                </Select>
              </div>

              {config.fields.includes('systemPrompt') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    系统提示词
                  </label>
                  <TextArea
                    rows={4}
                    value={node.data.systemPrompt || ""}
                    onChange={handleInputChange('systemPrompt')}
                    placeholder="输入系统提示词..."
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 高级参数 */}
        {isAINode && (
          <Card size="small" title="高级参数" className="shadow-sm">
            <div className="space-y-4">
              {config.fields.includes('temperature') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    温度 (Temperature): {node.data.temperature ?? 0.7}
                  </label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={node.data.temperature ?? 0.7}
                    onChange={handleSliderChange('temperature')}
                    tooltip={{ formatter: (value) => `${value}` }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    控制回答的随机性，值越高回答越有创意
                  </div>
                </div>
              )}

              {config.fields.includes('topP') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Top P: {node.data.topP ?? 0.8}
                  </label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={node.data.topP ?? 0.8}
                    onChange={handleSliderChange('topP')}
                    tooltip={{ formatter: (value) => `${value}` }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    控制词汇选择的多样性
                  </div>
                </div>
              )}

              {config.fields.includes('maxTokens') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最大Token数
                  </label>
                  <Input
                    type="number"
                    value={node.data.maxTokens || 1000}
                    onChange={handleInputChange('maxTokens')}
                    placeholder="1000"
                    min={1}
                    max={4000}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    限制生成内容的长度
                  </div>
                </div>
              )}

              {config.fields.includes('presencePenalty') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出现惩罚 (Presence Penalty): {node.data.presencePenalty ?? 0}
                  </label>
                  <Slider
                    min={-2}
                    max={2}
                    step={0.01}
                    value={node.data.presencePenalty ?? 0}
                    onChange={handleSliderChange('presencePenalty')}
                    tooltip={{ formatter: (value) => `${value}` }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    控制新信息出现的频率，值越高越倾向于生成新话题
                  </div>
                </div>
              )}

              {config.fields.includes('frequencyPenalty') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    频率惩罚 (Frequency Penalty): {node.data.frequencyPenalty ?? 0}
                  </label>
                  <Slider
                    min={-2}
                    max={2}
                    step={0.01}
                    value={node.data.frequencyPenalty ?? 0}
                    onChange={handleSliderChange('frequencyPenalty')}
                    tooltip={{ formatter: (value) => `${value}` }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    控制重复内容的惩罚，值越高越不容易重复
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 条件节点配置 */}
        {(node.type === 'decisionNode' || node.type === 'conditionNode') && (
          <Card size="small" title="条件配置" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  条件表达式
                </label>
                <Input
                  value={node.data.condition || ""}
                  onChange={handleInputChange('condition')}
                  placeholder="例如: input.length > 0"
                />
              </div>

              {node.type === 'conditionNode' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      操作符
                    </label>
                    <Select
                      value={node.data.operator || "equals"}
                      onChange={handleSelectChange('operator')}
                      className="w-full"
                    >
                      <Option value="equals">等于</Option>
                      <Option value="notEquals">不等于</Option>
                      <Option value="contains">包含</Option>
                      <Option value="startsWith">开始于</Option>
                      <Option value="endsWith">结束于</Option>
                      <Option value="greater">大于</Option>
                      <Option value="less">小于</Option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      比较值
                    </label>
                    <Input
                      value={node.data.value || ""}
                      onChange={handleInputChange('value')}
                      placeholder="输入比较值"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>
        )}

        {/* JSON提取器配置 */}
        {node.type === 'jsonExtractor' && (
          <Card size="small" title="提取配置" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON路径
                </label>
                <Input
                  value={node.data.jsonPath || ""}
                  onChange={handleInputChange('jsonPath')}
                  placeholder="例如: $.data.items[0].name"
                />
                <div className="text-xs text-gray-500 mt-1">
                  使用JSONPath语法指定要提取的字段
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输出格式
                </label>
                <Select
                  value={node.data.outputFormat || "string"}
                  onChange={handleSelectChange('outputFormat')}
                  className="w-full"
                >
                  <Option value="string">字符串</Option>
                  <Option value="number">数字</Option>
                  <Option value="boolean">布尔值</Option>
                  <Option value="array">数组</Option>
                  <Option value="object">对象</Option>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* 自定义节点配置 */}
        {node.type === 'customNode' && (
          <Card size="small" title="自定义配置" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义代码
                </label>
                <TextArea
                  rows={6}
                  value={node.data.customCode || ""}
                  onChange={handleInputChange('customCode')}
                  placeholder="// 输入自定义处理逻辑&#10;function process(input) {&#10;  // 处理逻辑&#10;  return output;&#10;}"
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参数配置 (JSON)
                </label>
                <TextArea
                  rows={3}
                  value={node.data.parameters || "{}"}
                  onChange={handleInputChange('parameters')}
                  placeholder='{"key": "value"}'
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </Card>
        )}

        {/* AI对话节点专门配置 */}
        {node.type === 'aiDialogNode' && (
          <Card size="small" title="数据来源配置" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数据来源
                </label>
                <Select
                  value={node.data.inputSource || "用户消息"}
                  onChange={handleSelectChange('inputSource')}
                  className="w-full"
                >
                  <Option value="用户消息">用户消息</Option>
                  <Option value="上一个节点执行结果">上一个节点执行结果</Option>
                </Select>
                <div className="text-xs text-gray-500 mt-1">
                  选择AI对话的输入数据来源
                </div>
              </div>

              {node.data.inputSource === '用户消息' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用户消息内容
                  </label>
                  <TextArea
                    rows={4}
                    value={node.data.userMessage || ""}
                    onChange={handleInputChange('userMessage')}
                    placeholder="请输入要发送给AI的用户消息内容..."
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    当选择"用户消息"时，AI将使用此固定消息进行对话
                  </div>
                </div>
              )}

              {node.data.inputSource === '上一个节点执行结果' && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700">
                    <div className="font-medium mb-1">📝 说明</div>
                    <div className="text-blue-600">
                      AI将使用连接到此节点的上一个节点的执行结果作为用户消息。请确保已正确连接上游节点。
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600">
                  <div className="font-medium mb-1">💡 使用建议</div>
                  <ul className="space-y-1">
                    <li>• <strong>用户消息</strong>: 适用于固定的AI对话场景，如固定问答</li>
                    <li>• <strong>上一个节点执行结果</strong>: 适用于需要处理动态数据的场景</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* AI输出控制配置 */}
        {node.type === 'aiDialogNode' && (
          <Card size="small" title="输出控制" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输出格式
                </label>
                <Select
                  value={node.data.outputFormat || "text"}
                  onChange={handleSelectChange('outputFormat')}
                  className="w-full"
                >
                  <Option value="text">纯文本</Option>
                  <Option value="json">JSON格式</Option>
                  <Option value="markdown">Markdown格式</Option>
                </Select>
                <div className="text-xs text-gray-500 mt-1">
                  指定AI回答的输出格式
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  响应模式
                </label>
                <Select
                  value={node.data.responseMode || "complete"}
                  onChange={handleSelectChange('responseMode')}
                  className="w-full"
                >
                  <Option value="complete">完整响应</Option>
                  <Option value="streaming">流式响应</Option>
                </Select>
                <div className="text-xs text-gray-500 mt-1">
                  选择AI响应的输出模式
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  超时时间 (秒)
                </label>
                <Input
                  type="number"
                  value={node.data.timeout || 30}
                  onChange={handleInputChange('timeout')}
                  placeholder="30"
                  min={1}
                  max={300}
                />
                <div className="text-xs text-gray-500 mt-1">
                  AI响应的最大等待时间
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PropertiesPanel;
