import React, { useCallback, useState, useEffect } from "react";
import {
  Typography,
  Input,
  Select,
  Slider,
  Switch,
  Button,
  Collapse,
  Tooltip,
  InputNumber,
} from "antd";
import {
  SettingOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
  CloudOutlined,
  EditOutlined,
  RobotOutlined,
  EyeInvisibleOutlined,
  BugOutlined,
} from "@ant-design/icons";
import type { Node, Edge } from "@xyflow/react";
import { flowService } from "../../../api/services/flowService";
import type { AiModelItem } from "#/entity";
import {
  INPUT_SOURCE_OPTIONS,
  DEFAULT_INPUT_SOURCE,
} from "../constants/inputSource";
import {
  ConditionNodeConfig,
  CONDITION_OPERATORS,
  CONDITION_TEMPLATES,
  DEFAULT_CONDITION_CONFIG,
} from "../types/conditionNodeConfig";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// Define interface for node data
interface NodeData {
  label?: string;
  description?: string;
  inputSource?: string;
  model?: string;
  systemPrompt?: string;
  userMessage?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  // AI摘要节点专属属性
  summaryStyle?: "bullet_points" | "paragraph" | "keywords" | "outline";
  summaryLength?: "short" | "medium" | "long";
  maxSummaryLength?: number;
  language?: string;
  includeKeyPoints?: boolean;
  extractKeywords?: boolean;
  // 其他节点属性
  dbType?: string;
  connectionString?: string;
  query?: string;
  timeout?: number;
  knowledgeBaseId?: string;
  searchQuery?: string;
  topK?: number;
  similarityThreshold?: number;
  condition?: string;
  conditionType?: string;
  trueBranch?:
    | string
    | { label: string; description?: string; outputData?: any };
  falseBranch?:
    | string
    | { label: string; description?: string; outputData?: any };
  jsonPath?: string;
  extractMode?: string;
  defaultValue?: string;
  responseTemplate?: string;
  responseFormat?: string;
  statusCode?: number;
  [key: string]: any;
}

interface PropertiesPanelProps {
  node: Node | null;
  edges: Edge[];
  onChange: (id: string, data: any) => void;
  onLabelChange: (id: string, label: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  node,
  edges,
  onChange,
  onLabelChange,
}) => {
  const [debugVisible, setDebugVisible] = useState(false);
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>([
    "basic",
    "specific",
  ]);

  // AI模型相关状态
  const [aiModels, setAiModels] = useState<AiModelItem[]>([]);
  const [aiModelsLoading, setAiModelsLoading] = useState(false);

  // 加载AI模型列表
  useEffect(() => {
    // 只有当节点是AI类型时才加载AI模型
    const isAINode =
      node?.type &&
      ["aiDialogNode", "aiSummaryNode", "aiExtractNode", "aiJsonNode"].includes(
        node.type
      );

    if (isAINode && aiModels.length === 0) {
      loadAiModels();
    }
  }, [node?.type]);

  const loadAiModels = async () => {
    setAiModelsLoading(true);
    try {
      const response = await flowService.getAiModelsByTypeId();

      setAiModels(response?.data || []);
    } catch (error) {
      console.error("Failed to load AI models:", error);
      // 设置默认模型作为fallback
      setAiModels([
        { aiModelId: "gpt-3.5-turbo", aiModelName: "GPT-3.5 Turbo" },
        { aiModelId: "gpt-4", aiModelName: "GPT-4" },
        { aiModelId: "gpt-4-turbo", aiModelName: "GPT-4 Turbo" },
      ]);
    } finally {
      setAiModelsLoading(false);
    }
  };

  // 处理面板宽度调整
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = panelWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = Math.max(
          280,
          Math.min(600, startWidth - (e.clientX - startX))
        );
        setPanelWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [panelWidth]
  );

  if (!node) {
    return (
      <div
        className="h-full border-l border-gray-200 bg-white flex flex-col relative"
        style={{ width: panelWidth }}
      >
        {/* 拖拽调整条 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 cursor-col-resize hover:bg-blue-400 transition-colors duration-200"
          onMouseDown={handleMouseDown}
        />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <EditOutlined className="text-2xl text-gray-400" />
          </div>
          <Title level={4} className="text-gray-600 mb-2">
            选择节点编辑
          </Title>
          <Paragraph type="secondary" className="text-sm max-w-48">
            点击画布中的任意节点即可在此处编辑其属性和配置
          </Paragraph>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-700 space-y-1">
              <div className="font-medium">💡 操作提示:</div>
              <div>• 拖拽左边缘可调整面板宽度</div>
              <div>• 不同节点类型有专属配置项</div>
              <div>• 支持实时预览配置效果</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 类型安全的数据访问
  const nodeData = (node.data || {}) as NodeData;

  // 获取当前节点的连接信息
  const getConnectionInfo = () => {
    const incomingEdges = edges.filter((edge) => edge.target === node.id);
    const outgoingEdges = edges.filter((edge) => edge.source === node.id);

    return {
      incoming: incomingEdges.map((edge) => edge.source),
      outgoing: outgoingEdges.map((edge) => edge.target),
      totalConnections: incomingEdges.length + outgoingEdges.length,
      incomingCount: incomingEdges.length,
      outgoingCount: outgoingEdges.length,
    };
  };

  // 获取节点类型图标和颜色
  const getNodeTypeInfo = (type: string) => {
    const typeMap: Record<
      string,
      { icon: React.ReactNode; color: string; label: string }
    > = {
      aiDialogNode: {
        icon: <RobotOutlined />,
        color: "#1677ff",
        label: "AI对话",
      },
      aiSummaryNode: {
        icon: <RobotOutlined />,
        color: "#13c2c2",
        label: "AI摘要",
      },
      aiExtractNode: {
        icon: <RobotOutlined />,
        color: "#722ed1",
        label: "AI提取",
      },
      aiJsonNode: {
        icon: <RobotOutlined />,
        color: "#eb2f96",
        label: "AI JSON",
      },
      databaseNode: {
        icon: <DatabaseOutlined />,
        color: "#52c41a",
        label: "数据库",
      },
      knowledgeBaseNode: {
        icon: <CloudOutlined />,
        color: "#faad14",
        label: "知识库",
      },
      bingNode: {
        icon: <CloudOutlined />,
        color: "#f5222d",
        label: "必应搜索",
      },
      responseNode: {
        icon: <EditOutlined />,
        color: "#13c2c2",
        label: "响应输出",
      },
      startNode: { icon: <EditOutlined />, color: "#52c41a", label: "开始" },
      endNode: { icon: <EditOutlined />, color: "#f5222d", label: "结束" },
      default: {
        icon: <SettingOutlined />,
        color: "#8c8c8c",
        label: "基础节点",
      },
    };
    return typeMap[type] || typeMap.default;
  };

  const nodeTypeInfo = getNodeTypeInfo(node.type || "");

  // 处理节点名称更改
  const handleLabelChange = (value: string) => {
    onLabelChange(node.id, value);
  };

  // 处理属性更改
  const handlePropertyChange = (propertyKey: string, value: any) => {
    onChange(node.id, { ...nodeData, [propertyKey]: value });
  };

  // 渲染基础属性编辑器
  const renderBasicProperties = () => (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      {/* 标题栏 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
        <EditOutlined className="text-gray-600" />
        <Text strong className="text-sm">
          基础属性
        </Text>
      </div>

      {/* 属性配置区域 */}
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Text strong className="text-sm">
              节点名称
            </Text>
            <Tooltip title="为节点设置一个易于识别的名称">
              <InfoCircleOutlined className="text-black text-xs" />
            </Tooltip>
          </div>
          <Input
            value={nodeData.label || ""}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="输入节点名称"
            size="large"
            className="rounded-lg"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Text strong className="text-sm">
              输入参数
            </Text>
            <Tooltip title="选择此节点的输入数据来源">
              <InfoCircleOutlined className="text-black text-xs" />
            </Tooltip>
          </div>
          <Select
            value={nodeData.inputSource || DEFAULT_INPUT_SOURCE}
            onChange={(value) => handlePropertyChange("inputSource", value)}
            className="w-full"
            size="large"
            placeholder="选择输入数据来源"
          >
            {INPUT_SOURCE_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                <div className="py-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Text strong className="text-sm">
                节点描述
              </Text>
              <Tooltip title="详细描述此节点的功能和用途">
                <InfoCircleOutlined className="text-black text-xs" />
              </Tooltip>
            </div>
            <Text className="text-xs text-gray-500">
              {(nodeData.description || "").length}/200
            </Text>
          </div>
          <TextArea
            value={nodeData.description || ""}
            onChange={(e) =>
              handlePropertyChange("description", e.target.value)
            }
            placeholder="输入节点描述，例如：此节点用于处理用户查询并返回AI回答"
            rows={3}
            className="rounded-lg"
            maxLength={200}
            showCount={false}
          />
          <div className="mt-1 text-xs text-gray-500">
            清晰的描述有助于团队协作和流程维护
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染AI对话节点属性
  const renderAIDialogProperties = () => (
    <div className="space-y-4">
      {/* AI模型配置 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        {/* 标题栏 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
          <RobotOutlined className="text-gray-600" />
          <Text strong className="text-sm">
            AI模型配置
          </Text>
        </div>

        {/* 配置区域 */}
        <div className="p-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  AI模型
                </Text>
                <span className="text-red-500">*</span>
                <Tooltip title="选择不同的AI模型会影响响应质量和速度">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
            </div>
            <Select
              value={nodeData.model}
              onChange={(value) => handlePropertyChange("model", value)}
              className="w-full"
              size="large"
              placeholder="请选择AI模型"
              loading={aiModelsLoading}
              status={!nodeData.model ? "error" : ""}
            >
              {(aiModels || []).map((model) => (
                <Option key={model.aiModelId} value={model.aiModelId}>
                  <div className="py-1">
                    <div className="font-medium">{model.aiModelName}</div>
                  </div>
                </Option>
              ))}
            </Select>
            {!nodeData.model && (
              <div className="text-red-500 text-xs mt-1">请选择AI模型</div>
            )}
          </div>
        </div>
      </div>

      {/* 提示词配置 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        {/* 标题栏 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
          <EditOutlined className="text-gray-600" />
          <Text strong className="text-sm">
            提示词配置
          </Text>
        </div>

        {/* 配置区域 */}
        <div className="p-4 space-y-4">
          {/* 系统提示词 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  系统提示词
                </Text>
                <Tooltip title="定义AI的角色、行为和回答风格">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Text className="text-xs text-gray-500">
                {(nodeData.systemPrompt || "").length}/2000
              </Text>
            </div>
            <TextArea
              value={nodeData.systemPrompt || ""}
              onChange={(e) =>
                handlePropertyChange("systemPrompt", e.target.value)
              }
              placeholder="例如：你是一个专业的客服助手，需要友好、耐心地回答用户问题..."
              rows={4}
              className="rounded-lg font-mono text-sm"
              maxLength={2000}
              showCount={false}
            />
          </div>

          {/* 用户消息模板 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  用户消息模板
                </Text>
                <Tooltip title="用户输入的消息模板，支持变量替换">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Text className="text-xs text-gray-500">
                {(nodeData.userMessage || "").length}/1000
              </Text>
            </div>
            <TextArea
              value={nodeData.userMessage || ""}
              onChange={(e) =>
                handlePropertyChange("userMessage", e.target.value)
              }
              placeholder="用户问题：{{input}}\n上下文：{{context}}"
              rows={3}
              className="rounded-lg font-mono text-sm"
              maxLength={1000}
              showCount={false}
            />
            <div className="mt-1 text-xs text-gray-500">
              支持变量：
              <code className="bg-gray-100 px-1 rounded">{`{{input}}`}</code>、
              <code className="bg-gray-100 px-1 rounded">{`{{context}}`}</code>
              、<code className="bg-gray-100 px-1 rounded">{`{{user}}`}</code>
            </div>
          </div>
        </div>
      </div>

      {/* 高级参数 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        {/* 标题栏 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
          <SettingOutlined className="text-gray-600" />
          <Text strong className="text-sm">
            高级参数
          </Text>
        </div>

        {/* 参数配置区域 */}
        <div className="p-4 space-y-6">
          {/* 创造性调节 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  创造性 (Temperature)
                </Text>
                <Tooltip title="控制AI回答的随机性，数值越高越创意">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium min-w-[40px] text-center">
                {nodeData.temperature || 0.7}
              </div>
            </div>
            <div className="px-2">
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={nodeData.temperature || 0.7}
                onChange={(value) => handlePropertyChange("temperature", value)}
                marks={{
                  0: {
                    label: <span className="text-xs text-gray-500">精确</span>,
                    style: { fontSize: "10px" },
                  },
                  0.5: {
                    label: <span className="text-xs text-gray-500">平衡</span>,
                    style: { fontSize: "10px" },
                  },
                  1: {
                    label: <span className="text-xs text-gray-500">创意</span>,
                    style: { fontSize: "10px" },
                  },
                }}
                tooltip={{
                  formatter: (value) => {
                    if (!value) return "0.7";
                    if (value < 0.3) return `${value} - 更精确`;
                    if (value > 0.7) return `${value} - 更创意`;
                    return `${value} - 平衡`;
                  },
                }}
                trackStyle={{ backgroundColor: "#1677ff" }}
                handleStyle={{ borderColor: "#1677ff" }}
              />
            </div>
          </div>

          {/* 最大令牌数 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  最大令牌数
                </Text>
                <Tooltip title="控制AI回答的最大长度">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Text className="text-xs text-gray-500">
                约 {Math.round((nodeData.maxTokens || 8000) * 0.75)} 字
              </Text>
            </div>
            <InputNumber
              min={1}
              max={8000}
              value={nodeData.maxTokens || 8000}
              onChange={(value) => handlePropertyChange("maxTokens", value)}
              className="w-full"
              placeholder="8000"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              size="middle"
              addonAfter="tokens"
            />
          </div>

          {/* 流式输出 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  流式输出
                </Text>
                <Tooltip title="是否逐字输出响应结果">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Text className="text-xs text-gray-500">
                {nodeData.stream ? "已启用" : "已禁用"}
              </Text>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Text className="text-sm font-medium">
                    {nodeData.stream ? "逐字输出" : "完整输出"}
                  </Text>
                  <div className="text-xs text-gray-500 mt-1 max-w-[200px]">
                    {nodeData.stream
                      ? "启用后将实时显示AI生成的内容"
                      : "等待AI完成后一次性显示完整回答"}
                  </div>
                </div>
                <div className="ml-3">
                  <Switch
                    checked={nodeData.stream || false}
                    onChange={(checked) =>
                      handlePropertyChange("stream", checked)
                    }
                    size="default"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染数据库节点属性
  const renderDatabaseProperties = () => (
    <div className="space-y-4">
      {/* 数据库类型 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">
            数据库类型
          </Text>
          <Tooltip title="选择要连接的数据库类型">
            <InfoCircleOutlined className="text-black text-xs" />
          </Tooltip>
        </div>
        <Select
          value={nodeData.dbType || "mysql"}
          onChange={(value) => handlePropertyChange("dbType", value)}
          className="w-full"
          size="large"
          placeholder="选择数据库类型"
        >
          <Option value="mysql">MySQL</Option>
          <Option value="postgresql">PostgreSQL</Option>
          <Option value="mongodb">MongoDB</Option>
          <Option value="redis">Redis</Option>
        </Select>
      </div>

      {/* 连接字符串 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">
            连接字符串
          </Text>
          <Tooltip title="数据库连接配置">
            <InfoCircleOutlined className="text-black text-xs" />
          </Tooltip>
        </div>
        <TextArea
          value={nodeData.connectionString || ""}
          onChange={(e) =>
            handlePropertyChange("connectionString", e.target.value)
          }
          placeholder="例如：mysql://user:password@host:port/database"
          rows={2}
          className="rounded-lg font-mono text-sm"
        />
      </div>

      {/* SQL查询 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">
            SQL查询
          </Text>
          <Tooltip title="要执行的SQL查询语句">
            <InfoCircleOutlined className="text-black text-xs" />
          </Tooltip>
        </div>
        <TextArea
          value={nodeData.query || ""}
          onChange={(e) => handlePropertyChange("query", e.target.value)}
          placeholder="SELECT * FROM users WHERE id = ?"
          rows={4}
          className="rounded-lg font-mono text-sm"
        />
      </div>
    </div>
  );

  // 渲染知识库节点属性
  const renderKnowledgeBaseProperties = () => (
    <div className="space-y-4">
      {/* 知识库选择 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">
            知识库
          </Text>
          <Tooltip title="选择要查询的知识库">
            <InfoCircleOutlined className="text-black text-xs" />
          </Tooltip>
        </div>
        <Select
          value={nodeData.knowledgeBaseId || ""}
          onChange={(value) => handlePropertyChange("knowledgeBaseId", value)}
          className="w-full"
          size="large"
          placeholder="选择知识库"
        >
          <Option value="kb1">产品知识库</Option>
          <Option value="kb2">技术文档库</Option>
          <Option value="kb3">FAQ知识库</Option>
        </Select>
      </div>

      {/* 检索参数 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Text strong className="text-sm">
              返回数量 (Top-K)
            </Text>
            <Tooltip title="检索结果的最大数量">
              <InfoCircleOutlined className="text-black text-xs" />
            </Tooltip>
          </div>
          <Text className="text-xs text-gray-500">{nodeData.topK || 5} 条</Text>
        </div>
        <Slider
          min={1}
          max={20}
          value={nodeData.topK || 5}
          onChange={(value) => handlePropertyChange("topK", value)}
          marks={{ 1: "1", 5: "5", 10: "10", 20: "20" }}
        />
      </div>

      {/* 相似度阈值 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Text strong className="text-sm">
              相似度阈值
            </Text>
            <Tooltip title="只返回相似度高于此阈值的结果">
              <InfoCircleOutlined className="text-black text-xs" />
            </Tooltip>
          </div>
          <Text className="text-xs text-gray-500">
            {nodeData.similarityThreshold || 0.7}
          </Text>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.1}
          value={nodeData.similarityThreshold || 0.7}
          onChange={(value) =>
            handlePropertyChange("similarityThreshold", value)
          }
          marks={{ 0: "0", 0.5: "0.5", 1: "1" }}
        />
      </div>
    </div>
  );

  // 渲染条件节点属性
  const renderConditionProperties = () => {
    const conditionConfig = { ...DEFAULT_CONDITION_CONFIG, ...nodeData };
    const isSimpleMode = conditionConfig.conditionType === "simple";
    const isMultipleConditions = conditionConfig.enableMultipleConditions;

    return (
      <div className="space-y-4">
        {/* 条件配置 */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
            <SettingOutlined className="text-gray-600" />
            <Text strong className="text-sm">
              条件配置
            </Text>
          </div>

          <div className="p-4 space-y-4">
            {/* 条件类型 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Text strong className="text-sm">
                  条件类型
                </Text>
                <Tooltip title="选择条件判断的方式">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Select
                value={conditionConfig.conditionType}
                onChange={(value) =>
                  handlePropertyChange("conditionType", value)
                }
                className="w-full"
                size="large"
              >
                <Option value="javascript">JavaScript表达式</Option>
                <Option value="jsonpath">JSONPath查询</Option>
                <Option value="simple">简单比较</Option>
                <Option value="regex">正则表达式</Option>
                <Option value="custom">自定义逻辑</Option>
              </Select>
            </div>

            {/* 快速模板 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Text strong className="text-sm">
                  快速模板
                </Text>
                <Tooltip title="选择预定义的条件模板">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Select
                placeholder="选择条件模板（可选）"
                className="w-full"
                size="large"
                allowClear
                onChange={(templateId) => {
                  if (templateId) {
                    const template = CONDITION_TEMPLATES.find(
                      (t) => t.id === templateId
                    );
                    if (template) {
                      handlePropertyChange(
                        "conditionType",
                        template.conditionType
                      );
                      handlePropertyChange("condition", template.condition);
                    }
                  }
                }}
              >
                {CONDITION_TEMPLATES.map((template) => (
                  <Option key={template.id} value={template.id}>
                    <div className="py-1">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500">
                        {template.description}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            {/* 简单比较模式 */}
            {isSimpleMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text strong className="text-sm mb-3 block">
                  简单比较配置
                </Text>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-5 gap-2 items-center">
                    <Input
                      placeholder="左操作数"
                      value={
                        conditionConfig.simpleComparison?.leftOperand || ""
                      }
                      onChange={(e) =>
                        handlePropertyChange("simpleComparison", {
                          ...conditionConfig.simpleComparison,
                          leftOperand: e.target.value,
                        })
                      }
                      className="col-span-2"
                    />
                    <Select
                      placeholder="操作符"
                      value={conditionConfig.simpleComparison?.operator}
                      onChange={(value) =>
                        handlePropertyChange("simpleComparison", {
                          ...conditionConfig.simpleComparison,
                          operator: value,
                        })
                      }
                      className="col-span-1"
                    >
                      {[
                        ...CONDITION_OPERATORS.COMPARISON,
                        ...CONDITION_OPERATORS.STRING,
                      ].map((op) => (
                        <Option key={op.value} value={op.value}>
                          <Tooltip title={op.symbol}>{op.label}</Tooltip>
                        </Option>
                      ))}
                    </Select>
                    <Input
                      placeholder="右操作数"
                      value={
                        conditionConfig.simpleComparison?.rightOperand || ""
                      }
                      onChange={(e) =>
                        handlePropertyChange("simpleComparison", {
                          ...conditionConfig.simpleComparison,
                          rightOperand: e.target.value,
                        })
                      }
                      className="col-span-2"
                    />
                  </div>
                  <div>
                    <Select
                      placeholder="数据类型"
                      value={
                        conditionConfig.simpleComparison?.dataType || "string"
                      }
                      onChange={(value) =>
                        handlePropertyChange("simpleComparison", {
                          ...conditionConfig.simpleComparison,
                          dataType: value,
                        })
                      }
                      className="w-full"
                    >
                      <Option value="string">字符串</Option>
                      <Option value="number">数字</Option>
                      <Option value="boolean">布尔值</Option>
                      <Option value="date">日期</Option>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* 条件表达式 */}
            {!isSimpleMode && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Text strong className="text-sm">
                    条件表达式
                  </Text>
                  <Tooltip title="输入条件判断表达式">
                    <InfoCircleOutlined className="text-black text-xs" />
                  </Tooltip>
                </div>
                <TextArea
                  value={conditionConfig.condition}
                  onChange={(e) =>
                    handlePropertyChange("condition", e.target.value)
                  }
                  placeholder={
                    conditionConfig.conditionType === "javascript"
                      ? '例如：input.value > 0 && input.status === "active"'
                      : conditionConfig.conditionType === "jsonpath"
                      ? "例如：$.user.age"
                      : conditionConfig.conditionType === "regex"
                      ? "例如：^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
                      : "输入自定义条件表达式"
                  }
                  rows={4}
                  className="rounded-lg font-mono text-sm"
                />
                {conditionConfig.conditionType === "javascript" && (
                  <div className="mt-2 text-xs text-gray-500">
                    支持变量：
                    <code className="bg-gray-100 px-1 rounded">input</code>、
                    <code className="bg-gray-100 px-1 rounded">context</code>、
                    <code className="bg-gray-100 px-1 rounded">user</code>
                  </div>
                )}
              </div>
            )}

            {/* 多条件支持 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  多条件判断
                </Text>
                <Tooltip title="启用多个条件的组合判断">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Switch
                checked={conditionConfig.enableMultipleConditions}
                onChange={(checked) =>
                  handlePropertyChange("enableMultipleConditions", checked)
                }
              />
            </div>

            {/* 多条件配置 */}
            {isMultipleConditions && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Text strong className="text-sm">
                    逻辑操作符
                  </Text>
                  <Select
                    value={conditionConfig.logicalOperator || "AND"}
                    onChange={(value) =>
                      handlePropertyChange("logicalOperator", value)
                    }
                    className="w-32"
                  >
                    <Option value="AND">并且 (&&)</Option>
                    <Option value="OR">或者 (||)</Option>
                  </Select>
                </div>
                <div className="text-xs text-gray-600">
                  多条件判断功能可在高级配置中进一步配置具体的条件列表
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 分支配置 */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
            <EditOutlined className="text-gray-600" />
            <Text strong className="text-sm">
              分支配置
            </Text>
          </div>

          <div className="p-4 space-y-4">
            {/* True分支 */}
            <div>
              <Text strong className="text-sm mb-2 block text-green-600">
                True 分支
              </Text>
              <div className="space-y-2">
                <Input
                  placeholder="True分支标签"
                  value={
                    typeof conditionConfig.trueBranch === "object"
                      ? conditionConfig.trueBranch?.label || "条件为真"
                      : "条件为真"
                  }
                  onChange={(e) =>
                    handlePropertyChange("trueBranch", {
                      ...(typeof conditionConfig.trueBranch === "object"
                        ? conditionConfig.trueBranch
                        : {}),
                      label: e.target.value,
                    })
                  }
                />
                <TextArea
                  placeholder="True分支描述"
                  value={
                    typeof conditionConfig.trueBranch === "object"
                      ? conditionConfig.trueBranch?.description || ""
                      : ""
                  }
                  onChange={(e) =>
                    handlePropertyChange("trueBranch", {
                      ...(typeof conditionConfig.trueBranch === "object"
                        ? conditionConfig.trueBranch
                        : {}),
                      description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
            </div>

            {/* False分支 */}
            <div>
              <Text strong className="text-sm mb-2 block text-red-600">
                False 分支
              </Text>
              <div className="space-y-2">
                <Input
                  placeholder="False分支标签"
                  value={
                    typeof conditionConfig.falseBranch === "object"
                      ? conditionConfig.falseBranch?.label || "条件为假"
                      : "条件为假"
                  }
                  onChange={(e) =>
                    handlePropertyChange("falseBranch", {
                      ...(typeof conditionConfig.falseBranch === "object"
                        ? conditionConfig.falseBranch
                        : {}),
                      label: e.target.value,
                    })
                  }
                />
                <TextArea
                  placeholder="False分支描述"
                  value={
                    typeof conditionConfig.falseBranch === "object"
                      ? conditionConfig.falseBranch?.description || ""
                      : ""
                  }
                  onChange={(e) =>
                    handlePropertyChange("falseBranch", {
                      ...(typeof conditionConfig.falseBranch === "object"
                        ? conditionConfig.falseBranch
                        : {}),
                      description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 高级配置 */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
            <SettingOutlined className="text-gray-600" />
            <Text strong className="text-sm">
              高级配置
            </Text>
          </div>

          <div className="p-4 space-y-4">
            {/* 错误处理 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Text strong className="text-sm">
                  错误处理
                </Text>
                <Tooltip title="条件执行出错时的处理方式">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Select
                value={conditionConfig.errorHandling?.onError || "false"}
                onChange={(value) =>
                  handlePropertyChange("errorHandling", {
                    ...conditionConfig.errorHandling,
                    onError: value,
                  })
                }
                className="w-full"
              >
                <Option value="throw">抛出异常</Option>
                <Option value="false">返回False</Option>
                <Option value="true">返回True</Option>
                <Option value="custom">自定义值</Option>
              </Select>
            </div>

            {/* 性能优化 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  启用缓存
                </Text>
                <Tooltip title="缓存条件判断结果以提升性能">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Switch
                checked={conditionConfig.enableCaching}
                onChange={(checked) =>
                  handlePropertyChange("enableCaching", checked)
                }
              />
            </div>

            {/* 缓存配置 */}
            {conditionConfig.enableCaching && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="space-y-2">
                  <div>
                    <Text className="text-sm">缓存时间 (秒)</Text>
                    <InputNumber
                      min={1}
                      max={3600}
                      value={conditionConfig.cacheTTL || 300}
                      onChange={(value) =>
                        handlePropertyChange("cacheTTL", value)
                      }
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 执行超时 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Text strong className="text-sm">
                  执行超时 (ms)
                </Text>
                <Text className="text-xs text-gray-500">
                  {conditionConfig.timeout || 5000}ms
                </Text>
              </div>
              <Slider
                min={1000}
                max={30000}
                step={1000}
                value={conditionConfig.timeout || 5000}
                onChange={(value) => handlePropertyChange("timeout", value)}
                marks={{ 1000: "1s", 5000: "5s", 15000: "15s", 30000: "30s" }}
              />
            </div>

            {/* 调试日志 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  调试日志
                </Text>
                <Tooltip title="记录条件执行的详细日志">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Switch
                checked={conditionConfig.enableLogging}
                onChange={(checked) =>
                  handlePropertyChange("enableLogging", checked)
                }
              />
            </div>

            {/* 日志级别 */}
            {conditionConfig.enableLogging && (
              <div>
                <Text strong className="text-sm mb-2 block">
                  日志级别
                </Text>
                <Select
                  value={conditionConfig.logLevel || "info"}
                  onChange={(value) => handlePropertyChange("logLevel", value)}
                  className="w-full"
                >
                  <Option value="debug">Debug</Option>
                  <Option value="info">Info</Option>
                  <Option value="warn">Warning</Option>
                  <Option value="error">Error</Option>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染响应节点属性
  const renderResponseProperties = () => (
    <div className="space-y-4">
      {/* 响应格式 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">
            响应格式
          </Text>
          <Tooltip title="选择响应数据的格式">
            <InfoCircleOutlined className="text-black text-xs" />
          </Tooltip>
        </div>
        <Select
          value={nodeData.responseFormat || "json"}
          onChange={(value) => handlePropertyChange("responseFormat", value)}
          className="w-full"
          size="large"
        >
          <Option value="json">JSON</Option>
          <Option value="text">纯文本</Option>
          <Option value="html">HTML</Option>
          <Option value="markdown">Markdown</Option>
        </Select>
      </div>

      {/* 响应模板 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">
            响应模板
          </Text>
          <Tooltip title="定义响应内容的模板">
            <InfoCircleOutlined className="text-black text-xs" />
          </Tooltip>
        </div>
        <TextArea
          value={nodeData.responseTemplate || ""}
          onChange={(e) =>
            handlePropertyChange("responseTemplate", e.target.value)
          }
          placeholder="例如：处理结果：{{result}}"
          rows={4}
          className="rounded-lg font-mono text-sm"
        />
      </div>

      {/* HTTP状态码 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">
            HTTP状态码
          </Text>
          <Tooltip title="设置响应的HTTP状态码">
            <InfoCircleOutlined className="text-black text-xs" />
          </Tooltip>
        </div>
        <InputNumber
          min={200}
          max={599}
          value={nodeData.statusCode || 200}
          onChange={(value) => handlePropertyChange("statusCode", value)}
          className="w-full"
          size="large"
        />
      </div>
    </div>
  );

  // 渲染AI摘要节点属性
  const renderAISummaryProperties = () => (
    <div className="space-y-4">
      {/* AI模型配置 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        {/* 标题栏 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
          <RobotOutlined className="text-gray-600" />
          <Text strong className="text-sm">
            AI模型配置
          </Text>
        </div>

        {/* 配置区域 */}
        <div className="p-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  AI模型
                </Text>
                <span className="text-red-500">*</span>
                <Tooltip title="选择不同的AI模型会影响摘要质量和速度">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
            </div>
            <Select
              value={nodeData.model}
              onChange={(value) => handlePropertyChange("model", value)}
              className="w-full"
              size="large"
              placeholder="请选择AI模型"
              loading={aiModelsLoading}
              status={!nodeData.model ? "error" : ""}
            >
              {(aiModels || []).map((model) => (
                <Option key={model.aiModelId} value={model.aiModelId}>
                  <div className="py-1">
                    <div className="font-medium">{model.aiModelName}</div>
                  </div>
                </Option>
              ))}
            </Select>
            {!nodeData.model && (
              <div className="text-red-500 text-xs mt-1">请选择AI模型</div>
            )}
          </div>
        </div>
      </div>

      {/* 摘要配置 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        {/* 标题栏 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
          <EditOutlined className="text-gray-600" />
          <Text strong className="text-sm">
            摘要配置
          </Text>
        </div>

        {/* 配置区域 */}
        <div className="p-4 space-y-4">
          {/* 摘要风格 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Text strong className="text-sm">
                摘要风格
              </Text>
              <Tooltip title="选择摘要的输出风格">
                <InfoCircleOutlined className="text-black text-xs" />
              </Tooltip>
            </div>
            <Select
              value={nodeData.summaryStyle || "paragraph"}
              onChange={(value) => handlePropertyChange("summaryStyle", value)}
              className="w-full"
              size="large"
            >
              <Option value="paragraph">段落摘要</Option>
              <Option value="bullet_points">要点列表</Option>
              <Option value="keywords">关键词</Option>
              <Option value="outline">大纲形式</Option>
            </Select>
          </div>

          {/* 摘要长度 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Text strong className="text-sm">
                摘要长度
              </Text>
              <Tooltip title="控制摘要的详细程度">
                <InfoCircleOutlined className="text-black text-xs" />
              </Tooltip>
            </div>
            <Select
              value={nodeData.summaryLength || "medium"}
              onChange={(value) => handlePropertyChange("summaryLength", value)}
              className="w-full"
              size="large"
            >
              <Option value="short">简短 (50-100字)</Option>
              <Option value="medium">中等 (100-300字)</Option>
              <Option value="long">详细 (300-500字)</Option>
            </Select>
          </div>

          {/* 最大摘要长度 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  最大摘要长度
                </Text>
                <Tooltip title="限制摘要的最大字符数">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Text className="text-xs text-gray-500">
                {nodeData.maxSummaryLength || 300} 字符
              </Text>
            </div>
            <Slider
              min={50}
              max={1000}
              step={50}
              value={nodeData.maxSummaryLength || 300}
              onChange={(value) =>
                handlePropertyChange("maxSummaryLength", value)
              }
              marks={{ 50: "50", 300: "300", 500: "500", 1000: "1000" }}
            />
          </div>

          {/* 语言设置 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Text strong className="text-sm">
                输出语言
              </Text>
              <Tooltip title="选择摘要的输出语言">
                <InfoCircleOutlined className="text-black text-xs" />
              </Tooltip>
            </div>
            <Select
              value={nodeData.language || "zh-CN"}
              onChange={(value) => handlePropertyChange("language", value)}
              className="w-full"
              size="large"
            >
              <Option value="zh-CN">中文</Option>
              <Option value="en-US">英文</Option>
              <Option value="ja-JP">日文</Option>
              <Option value="ko-KR">韩文</Option>
            </Select>
          </div>
        </div>
      </div>

      {/* 高级功能 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        {/* 标题栏 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
          <SettingOutlined className="text-gray-600" />
          <Text strong className="text-sm">
            高级功能
          </Text>
        </div>

        {/* 配置区域 */}
        <div className="p-4 space-y-4">
          {/* 包含要点 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Text strong className="text-sm">
                包含要点
              </Text>
              <Tooltip title="在摘要中包含关键要点">
                <InfoCircleOutlined className="text-black text-xs" />
              </Tooltip>
            </div>
            <Switch
              checked={nodeData.includeKeyPoints || false}
              onChange={(checked) =>
                handlePropertyChange("includeKeyPoints", checked)
              }
              size="default"
            />
          </div>

          {/* 提取关键词 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Text strong className="text-sm">
                提取关键词
              </Text>
              <Tooltip title="额外提取文本中的关键词">
                <InfoCircleOutlined className="text-black text-xs" />
              </Tooltip>
            </div>
            <Switch
              checked={nodeData.extractKeywords || false}
              onChange={(checked) =>
                handlePropertyChange("extractKeywords", checked)
              }
              size="default"
            />
          </div>

          {/* 创造性调节 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  创造性 (Temperature)
                </Text>
                <Tooltip title="控制摘要的创造性，数值越高越有创意">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium min-w-[40px] text-center">
                {nodeData.temperature || 0.3}
              </div>
            </div>
            <div className="px-2">
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={nodeData.temperature || 0.3}
                onChange={(value) => handlePropertyChange("temperature", value)}
                marks={{
                  0: {
                    label: <span className="text-xs text-gray-500">精确</span>,
                    style: { fontSize: "10px" },
                  },
                  0.3: {
                    label: <span className="text-xs text-gray-500">平衡</span>,
                    style: { fontSize: "10px" },
                  },
                  0.7: {
                    label: <span className="text-xs text-gray-500">创意</span>,
                    style: { fontSize: "10px" },
                  },
                }}
                tooltip={{
                  formatter: (value) => {
                    if (!value) return "0.3";
                    if (value < 0.3) return `${value} - 更精确`;
                    if (value > 0.7) return `${value} - 更创意`;
                    return `${value} - 平衡`;
                  },
                }}
                trackStyle={{ backgroundColor: "#1677ff" }}
                handleStyle={{ borderColor: "#1677ff" }}
              />
            </div>
          </div>

          {/* 最大令牌数 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  最大令牌数
                </Text>
                <Tooltip title="控制摘要的最大长度">
                  <InfoCircleOutlined className="text-black text-xs" />
                </Tooltip>
              </div>
              <Text className="text-xs text-gray-500">
                约 {Math.round((nodeData.maxTokens || 1000) * 0.75)} 字
              </Text>
            </div>
            <InputNumber
              min={100}
              max={4000}
              value={nodeData.maxTokens || 1000}
              onChange={(value) => handlePropertyChange("maxTokens", value)}
              className="w-full"
              placeholder="1000"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              size="middle"
              addonAfter="tokens"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpecificProperties = () => {
    switch (node.type) {
      case "aiDialogNode":
      case "aiExtractNode":
      case "aiJsonNode":
        return renderAIDialogProperties();
      case "aiSummaryNode":
        return renderAISummaryProperties();
      case "databaseNode":
        return renderDatabaseProperties();
      case "knowledgeBaseNode":
        return renderKnowledgeBaseProperties();
      case "conditionNode":
        return renderConditionProperties();
      case "responseNode":
        return renderResponseProperties();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <SettingOutlined className="text-2xl mb-2" />
            <div>此节点类型暂无特殊配置</div>
          </div>
        );
    }
  };

  return (
    <div
      className="h-full border-l border-gray-200 bg-white flex flex-col relative"
      style={{ width: panelWidth }}
    >
      {/* 拖拽调整条 */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors duration-200 ${
          isResizing ? "bg-blue-500" : "bg-gray-200 hover:bg-blue-400"
        }`}
        onMouseDown={handleMouseDown}
      />

      {/* 面板头部 */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: nodeTypeInfo.color }}
            >
              {nodeTypeInfo.icon}
            </div>
            <div>
              <Title level={5} className="m-0">
                {nodeTypeInfo.label}
              </Title>
              <Text type="secondary" className="text-xs">
                {nodeData.label || `未命名${nodeTypeInfo.label}`}
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip title={debugVisible ? "隐藏调试信息" : "显示调试信息"}>
              <Button
                type="text"
                size="small"
                icon={debugVisible ? <EyeInvisibleOutlined /> : <BugOutlined />}
                onClick={() => setDebugVisible(!debugVisible)}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Collapse
            activeKey={activeCollapseKeys}
            onChange={(keys) => setActiveCollapseKeys(keys as string[])}
            ghost
            size="small"
          >
            {/* 基础属性 */}
            <Panel header="基础属性" key="basic">
              {renderBasicProperties()}
            </Panel>

            {/* 特定属性 */}
            <Panel header="节点配置" key="specific">
              {renderSpecificProperties()}
            </Panel>

            {/* 调试信息 */}
            {debugVisible && (
              <Panel header="调试信息" key="debug">
                <div className="space-y-3">
                  <div>
                    <Text strong className="text-sm">
                      节点数据:
                    </Text>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-40 mt-1">
                      {JSON.stringify(nodeData, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <Text strong className="text-sm">
                      连接信息:
                    </Text>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-40 mt-1">
                      {JSON.stringify(getConnectionInfo(), null, 2)}
                    </pre>
                  </div>
                </div>
              </Panel>
            )}
          </Collapse>
        </div>
      </div>

      {/* 面板底部 */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          宽度: {panelWidth}px | 节点类型: {node.type}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
