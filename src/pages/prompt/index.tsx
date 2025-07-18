import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Input,
  Space,
  Typography,
  message,
  Row,
  Collapse,
  Badge,
  Empty,
} from "antd";
import {
  ExperimentOutlined,
  FunctionOutlined,
  BulbOutlined,
  RobotOutlined,
  ReloadOutlined,
  UserOutlined,
  SettingOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";

import ModelSelector from "@/pages/Chat/components/ModelSelector";
import OptimizationModal from "./components/OptimizationModal";
import ChatMessages from "./components/ChatMessages";
import SimpleMessageInput from "./components/SimpleMessageInput";
import { promptService, generatePrompt } from "@/api/services/promptService";
import type {
  GeneratePromptInput,
  OptimizationResult,
  ChatMessage,
  RunPromptInput,
  StreamingContent,
} from "./types";
import styles from "./index.module.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

export default function PromptPage() {
  // 基础状态
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);


  // 评估相关状态
  const [evaluationContent, setEvaluationContent] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);


  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [deepReasoningContent, setDeepReasoningContent] = useState('');
  const [isDeepReasoning, setIsDeepReasoning] = useState(false);

  // 推理时间相关状态
  const [reasoningStartTime, setReasoningStartTime] = useState<number | null>(null);
  const [reasoningDuration, setReasoningDuration] = useState<number>(0);

  // 优化相关状态
  const [optimizationType, setOptimizationType] = useState<
    "function-calling" | "prompt-optimization" | null
  >(null);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [streamingContent, setStreamingContent] = useState<StreamingContent>({
    deepReasoning: "",
    optimizedPrompt: "",
    evaluation: "",
  });

  const abortControllerRef = useRef<AbortController | null>(null);


  // UI状态
  const [isRunning, setIsRunning] = useState(false);
  const [systemPromptCollapsed, setSystemPromptCollapsed] = useState(true);
  const [messageInputs, setMessageInputs] = useState<
    Array<{ id: string; role: "user" | "assistant" }>
  >([]);

  // SSE连接管理
  const eventSourceRef = useRef<EventSource | null>(null);

  // 处理模型选择
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
  };

  // 处理优化类型选择
  const handleOptimizationTypeSelect = (
    type: "function-calling" | "prompt-optimization"
  ) => {
    setOptimizationType(type);
    setShowOptimizationModal(true);
  };

  // 处理优化请求
  const handleOptimize = async (config: GeneratePromptInput) => {
    setIsOptimizing(true);
    setOptimizationResult(null);

    // 重置流式内容
    setStreamingContent({
      deepReasoning: "",
      optimizedPrompt: "",
      evaluation: "",
    });

    // 创建SSE连接
    abortControllerRef.current = new AbortController();

    try {
      // 调用promptApi生成提示词
      for await (const event of generatePrompt({
        prompt: value.prompt,
        requirements: value.requirements,
        enableDeepReasoning: value.enableDeepReasoning,
        chatModel: value.chatModel,
        language: value.language
      })) {
        // 检查是否已被取消
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        // 处理流式响应数据
        if (event.data) {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "deep-reasoning-start") {
              setIsDeepReasoning(true);
              setReasoningStartTime(Date.now());
            } else if (data.type === "deep-reasoning-end") {
              setIsDeepReasoning(false);
              const endTime = Date.now();
              // 使用当前时间和开始时间计算持续时间
              if (reasoningStartTime !== null) {
                setReasoningDuration(endTime - reasoningStartTime);
              }
            } else if (data.type === "deep-reasoning") {
              if (data.message) {
                setDeepReasoningContent(prev => prev + data.message);
              }
            } else if (data.type === "evaluate-start") {
              setIsEvaluating(true);
            } else if (data.type === "evaluate-end") {
              setIsEvaluating(false);
            } else if (data.type === "evaluate") {
              if (data.message) {
                setEvaluationContent(prev => prev + data.message);
              }
            } else if (data.type === "error") {
              // 处理错误类型
              console.error('生成过程中发生错误:', data.message || data.error);
              message.error(data.message || data.error || t('generatePrompt.generateFailed'));
              break;
            } else if (data.type === "message") {
              if (data.message) {
                setGeneratedPrompt(prev => prev + data.message);
              }
            }

            // 检查是否完成
            if (data.done || event.event === 'done') {
              break;
            }
          } catch (e) {
            // 如果不是JSON格式，直接添加到结果中
            if (event.data !== '[DONE]') {
              if (isDeepReasoning) {
                setDeepReasoningContent(prev => prev + event.data);
              } else {
                setGeneratedPrompt(prev => prev + event.data);
              }
            } else {
              break;
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 请求被取消，不显示错误
        return;
      }
      console.error('生成提示词失败:', error);
    } finally {
      abortControllerRef.current = null;
    }

  };

  // 添加消息输入框
  const handleAddMessageInput = (role: "user" | "assistant") => {
    // 检查是否有最新的空输入框
    const lastInput = messageInputs[messageInputs.length - 1];
    if (lastInput && lastInput.role === role) {
      // 如果最新的输入框是同类型的，直接复用
      return;
    }

    // 如果最新的输入框是空的，先移除它
    if (messageInputs.length > 0) {
      setMessageInputs((prev) => prev.slice(0, -1));
    }

    // 添加新的输入框
    const newInput = {
      id: `input_${Date.now()}`,
      role,
    };
    setMessageInputs((prev) => [...prev, newInput]);
  };

  // 完成消息输入
  const handleCompleteMessage = (message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
    // 移除对应的输入框
    setMessageInputs((prev) => prev.slice(0, -1));
  };

  // 移除消息输入框
  const handleRemoveMessageInput = (inputId: string) => {
    setMessageInputs((prev) => prev.filter((input) => input.id !== inputId));
  };

  // 删除消息
  const handleDeleteMessage = (id: string) => {
    setChatMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  // 运行提示词
  const handleRun = async () => {
    if (!selectedModel) {
      message.warning("请先选择模型");
      return;
    }

    if (!userInput.trim() && chatMessages.length === 0) {
      message.warning("请先输入消息或添加聊天历史");
      return;
    }

    setIsRunning(true);

    try {
      const runInput: RunPromptInput = {
        systemPrompt: systemPrompt.trim() || undefined,
        userInput: userInput.trim(),
        messages: chatMessages,
        modelId: selectedModel,
        additionalMessage: optimizationResult?.optimizedPrompt,
      };

      // TODO: 调用后台运行API
      console.log("运行参数:", runInput);

      // 模拟运行过程
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success("运行完成");
    } catch (error) {
      console.error("运行失败:", error);
      message.error("运行失败，请重试");
    } finally {
      setIsRunning(false);
    }
  };

  // 重置所有状态
  const handleReset = () => {
    setUserInput("");
    setSystemPrompt("");
    setChatMessages([]);
    setOptimizationResult(null);
    setStreamingContent({
      deepReasoning: "",
      optimizedPrompt: "",
      evaluation: "",
    });
    setMessageInputs([]);
  };

  // 清理SSE连接
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className={styles.promptPage}>
      <div className={styles.mainContainer}>
        {/* 第一层：介绍 */}
        <Card className={styles.headerCard}>
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className={styles.headerTitle}>
                <ExperimentOutlined className="mr-2" />
                提示词优化工具
              </Title>
              <Paragraph className={styles.headerDescription}>
                智能优化您的提示词，支持 Function Calling
                和通用提示词优化，提升AI理解和响应质量
              </Paragraph>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              size="large"
            >
              重置
            </Button>
          </div>
        </Card>

        {/* 主要内容区域：左右布局 */}
        <Row gutter={[16, 16]}>
          {/* 左侧：配置面板 */}
          <Col xs={24} lg={16}>
            <div className={styles.leftPanel}>
              {/* 第二层：模型选择 + 优化操作 + 运行按钮 */}
              <Card className={styles.sectionCard}>
                <Row gutter={[16, 16]} align="middle">
                  {/* 模型选择 */}
                  <Col xs={24} sm={8}>
                    <div className={styles.modelSection}>
                      <div className={styles.sectionTitle}>
                        <RobotOutlined
                          className={`${styles.sectionIcon} text-blue-500`}
                        />
                        选择模型
                      </div>
                      <ModelSelector
                        value={selectedModel}
                        onChange={handleModelChange}
                      />
                    </div>
                  </Col>

                  {/* 优化操作 */}
                  <Col xs={24} sm={12}>
                    <div className={styles.optimizationSection}>
                      <div className={styles.sectionTitle}>
                        <ExperimentOutlined
                          className={`${styles.sectionIcon} text-orange-500`}
                        />
                        提示词优化
                      </div>
                      <div className={styles.optimizationButtons}>
                        <Button
                          className={`${styles.optimizationButton} ${styles.functionCallingBtn}`}
                          onClick={() =>
                            handleOptimizationTypeSelect("function-calling")
                          }
                          disabled={isOptimizing}
                          loading={
                            isOptimizing &&
                            optimizationType === "function-calling"
                          }
                        >
                          Function Calling 优化
                        </Button>
                        <Button
                          className={`${styles.optimizationButton} ${styles.promptOptimizationBtn}`}
                          onClick={() =>
                            handleOptimizationTypeSelect("prompt-optimization")
                          }
                          disabled={isOptimizing}
                          loading={
                            isOptimizing &&
                            optimizationType === "prompt-optimization"
                          }
                        >
                          通用提示词优化
                        </Button>
                      </div>
                    </div>
                  </Col>

                  {/* 运行按钮 */}
                  <Col xs={24} sm={4}>
                    <div className={styles.runSection}>
                      <div className={styles.sectionTitle}>
                        <PlayCircleOutlined
                          className={`${styles.sectionIcon} text-green-500`}
                        />
                        执行
                      </div>
                      <Button
                        className={styles.runButton}
                        icon={<SendOutlined />}
                        onClick={handleRun}
                        disabled={
                          (!userInput.trim() && chatMessages.length === 0) ||
                          !selectedModel
                        }
                        loading={isRunning}
                      >
                        运行
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* 第三层：系统提示词 */}
              <Card className={styles.sectionCard}>
                <Collapse
                  activeKey={systemPromptCollapsed ? [] : ["system"]}
                  onChange={(keys) =>
                    setSystemPromptCollapsed(!keys.includes("system"))
                  }
                  ghost
                  className={styles.systemPromptCollapse}
                >
                  <Panel
                    header={
                      <div className="flex items-center">
                        <SettingOutlined className="mr-2 text-purple-500" />
                        <Text strong>系统提示词 (可选)</Text>
                        <Text type="secondary" className="ml-2 text-sm">
                          - 定义AI的角色和行为规范
                        </Text>
                      </div>
                    }
                    key="system"
                    extra={
                      <Badge
                        status={systemPrompt.trim() ? "success" : "default"}
                        text={systemPrompt.trim() ? "已设置" : "未设置"}
                      />
                    }
                  >
                    <TextArea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="可选：输入系统提示词来定义AI的角色和行为规范...

示例：
你是一位资深的AI助手，具备以下特质：
- 准确理解用户需求
- 提供专业、详细的回答
- 保持友好和耐心的沟通风格"
                      rows={6}
                      showCount
                      maxLength={2000}
                      className="resize-none"
                    />
                  </Panel>
                </Collapse>
              </Card>

              {/* 第四层：用户输入区域 */}
              <Card
                className={`${styles.sectionCard} ${styles.userInputSection}`}
              >
                <div className={styles.sectionTitle}>
                  <MessageOutlined
                    className={`${styles.sectionIcon} text-blue-500`}
                  />
                  聊天消息输入
                </div>
                <TextArea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="请输入您的消息内容...

这里输入的内容可以：
1. 直接运行（点击右上角运行按钮）
2. 进行提示词优化
3. 添加为用户或助手消息到聊天历史"
                  rows={6}
                  showCount
                  maxLength={5000}
                  className={styles.userInputTextarea}
                />
              </Card>

              {/* 第五层：聊天历史管理 */}
              <Card
                className={`${styles.sectionCard} ${styles.chatHistorySection}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={styles.sectionTitle}>
                    <MessageOutlined
                      className={`${styles.sectionIcon} text-green-500`}
                    />
                    聊天历史
                    <Badge
                      count={chatMessages.length}
                      style={{ marginLeft: 8 }}
                    />
                  </div>
                  <div className={styles.addMessageButtons}>
                    <Button
                      className={styles.addUserMessageBtn}
                      icon={<UserOutlined />}
                      onClick={() => handleAddMessageInput("user")}
                    >
                      添加用户消息
                    </Button>
                    <Button
                      className={styles.addAssistantMessageBtn}
                      icon={<RobotOutlined />}
                      onClick={() => handleAddMessageInput("assistant")}
                    >
                      添加助手消息
                    </Button>
                  </div>
                </div>

                {/* 聊天消息展示 */}
                <ChatMessages
                  messages={chatMessages}
                  onDeleteMessage={handleDeleteMessage}
                />

                {/* 叠加的消息输入框 */}
                {messageInputs.map((input, index) => (
                  <SimpleMessageInput
                    key={input.id}
                    role={input.role}
                    onComplete={handleCompleteMessage}
                    onRemove={() => handleRemoveMessageInput(input.id)}
                    autoFocus={index === messageInputs.length - 1}
                  />
                ))}
              </Card>
            </div>
          </Col>

          {/* 右侧：结果展示面板 */}
          <Col xs={24} lg={8}>
            <div className={styles.rightPanel}>
              <div className={styles.emptyState}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-center">
                      <Text type="secondary">点击左侧优化按钮开始优化</Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        优化结果将在模态框中实时展示
                      </Text>
                    </div>
                  }
                />
              </div>
            </div>
          </Col>
        </Row>

        {/* 优化配置模态框 */}
        <OptimizationModal
          visible={showOptimizationModal}
          optimizationType={optimizationType}
          onCancel={() => setShowOptimizationModal(false)}
          onConfirm={handleOptimize}
          initialData={{
            Prompt: userInput,
            Requirements: "",
            EnableDeepReasoning: false,
            ModelId: selectedModel,
          }}
          optimizationResult={optimizationResult}
          streamingContent={streamingContent}
          isOptimizing={isOptimizing}
        />
      </div>
    </div>
  );
}
