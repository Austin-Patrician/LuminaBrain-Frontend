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
  Modal,
  Spin,
  Alert,
} from "antd";
import {
  ExperimentOutlined,
  BulbOutlined,
  RobotOutlined,
  ReloadOutlined,
  UserOutlined,
  SettingOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useTranslation } from 'react-i18next';

import ModelSelector from "@/pages/Chat/components/ModelSelector";
import OptimizationModal from "./components/OptimizationModal";
import ChatMessages from "./components/ChatMessages";
import SimpleMessageInput from "./components/SimpleMessageInput";
import StatusIndicator from "./components/StatusIndicator";
import ModalMarkdown from "@/components/markdown/modal-markdown";
import { generatePrompt, generateFunctionCallingPrompt } from "@/api/services/promptService";
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
  const { t, i18n } = useTranslation();

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
  const [showResultModal, setShowResultModal] = useState(false);
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

    if (config.Prompt === '') {
      message.error(('generatePrompt.promptRequired'));
      return
    }

    // 关闭配置模态框，显示结果模态框
    setShowOptimizationModal(false);
    setShowResultModal(true);

    setIsOptimizing(true);
    setOptimizationResult(null);
    // 重置所有相关状态
    setGeneratedPrompt('');
    setDeepReasoningContent('');
    setEvaluationContent('');
    setIsDeepReasoning(false);
    setIsEvaluating(false);
    setReasoningStartTime(null);
    setReasoningDuration(0);

    // 重置流式内容
    setStreamingContent({
      deepReasoning: "",
      optimizedPrompt: "",
      evaluation: "",
    });

    // 创建SSE连接
    abortControllerRef.current = new AbortController();

    try {
      // 根据优化类型选择合适的API
      const apiCall = optimizationType === "function-calling"
        ? generateFunctionCallingPrompt
        : generatePrompt;

      // 映射参数到API需要的格式
      const apiParams = {
        prompt: config.Prompt,
        requirements: config.Requirements || "",
        enableDeepReasoning: config.EnableDeepReasoning,
        modelId: config.ModelId,
        language: i18n.language || "zh_CN" // 默认语言
      };

      // 调用相应的API
      for await (const event of apiCall(apiParams)) {
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
                // 同时更新 streamingContent 以保持兼容性
                setStreamingContent(prev => ({
                  ...prev,
                  deepReasoning: prev.deepReasoning + data.message
                }));
              }
            } else if (data.type === "evaluate-start") {
              setIsEvaluating(true);
            } else if (data.type === "evaluate-end") {
              setIsEvaluating(false);
            } else if (data.type === "evaluate") {
              if (data.message) {
                setEvaluationContent(prev => prev + data.message);
                // 同时更新 streamingContent 以保持兼容性
                setStreamingContent(prev => ({
                  ...prev,
                  evaluation: prev.evaluation + data.message
                }));
              }
            } else if (data.type === "error") {
              // 处理错误类型
              console.error('生成过程中发生错误:', data.message || data.error);
              message.error(data.message || data.error || '优化失败，请重试');
              break;
            } else if (data.type === "message") {
              if (data.message) {
                setGeneratedPrompt(prev => prev + data.message);
                // 同时更新 streamingContent 以保持兼容性
                setStreamingContent(prev => ({
                  ...prev,
                  optimizedPrompt: prev.optimizedPrompt + data.message
                }));
              }
            }

            // 检查是否完成
            if (data.done || event.event === 'done') {
              // 创建最终的优化结果
              const result: OptimizationResult = {
                originalPrompt: config.Prompt,
                optimizedPrompt: generatedPrompt,
                deepReasoning: config.EnableDeepReasoning ? deepReasoningContent : undefined,
                evaluation: evaluationContent,
                optimizationType: optimizationType!,
                timestamp: new Date(),
              };
              setOptimizationResult(result);
              break;
            }
          } catch (e) {
            // 如果不是JSON格式，直接添加到结果中
            if (event.data !== '[DONE]') {
              if (isDeepReasoning) {
                setDeepReasoningContent(prev => prev + event.data);
                setStreamingContent(prev => ({
                  ...prev,
                  deepReasoning: prev.deepReasoning + event.data
                }));
              } else {
                setGeneratedPrompt(prev => prev + event.data);
                setStreamingContent(prev => ({
                  ...prev,
                  optimizedPrompt: prev.optimizedPrompt + event.data
                }));
              }
            } else {
              // 完成时创建结果
              const result: OptimizationResult = {
                originalPrompt: config.Prompt,
                optimizedPrompt: generatedPrompt,
                deepReasoning: config.EnableDeepReasoning ? deepReasoningContent : undefined,
                evaluation: evaluationContent,
                optimizationType: optimizationType!,
                timestamp: new Date(),
              };
              setOptimizationResult(result);
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
      message.error('优化失败，请重试');
    } finally {
      setIsOptimizing(false);
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

    // 重置新增的状态
    setGeneratedPrompt('');
    setDeepReasoningContent('');
    setEvaluationContent('');
    setIsDeepReasoning(false);
    setIsEvaluating(false);
    setReasoningStartTime(null);
    setReasoningDuration(0);
    setIsOptimizing(false);

    // 取消正在进行的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
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

          {/* 右侧：状态展示面板 */}
          <Col xs={24} lg={8}>
            <div className={styles.rightPanel}>
              {/* 状态指示器 */}
              <StatusIndicator
                isOptimizing={isOptimizing}
                isDeepReasoning={isDeepReasoning}
                isEvaluating={isEvaluating}
                reasoningDuration={reasoningDuration}
                reasoningStartTime={reasoningStartTime}
                hasDeepReasoningContent={deepReasoningContent.length > 0}
                hasOptimizedContent={generatedPrompt.length > 0}
                hasEvaluationContent={evaluationContent.length > 0}
              />

              {/* 空状态或结果提示 */}
              {!isOptimizing && !optimizationResult && (
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
              )}

              {/* 优化完成后的结果摘要 */}
              {optimizationResult && !isOptimizing && (
                <Card size="small" className="mt-4">
                  <div className="text-center">
                    <Text strong className="text-green-600">
                      ✅ 优化已完成
                    </Text>
                    <div className="mt-2">
                      <Text type="secondary" className="text-sm">
                        优化类型: {optimizationResult.optimizationType === "function-calling" ? "Function Calling" : "通用优化"}
                      </Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        完成时间: {optimizationResult.timestamp.toLocaleTimeString()}
                      </Text>
                      {reasoningDuration > 0 && (
                        <>
                          <br />
                          <Text type="secondary" className="text-sm">
                            推理耗时: {reasoningDuration < 1000 ? `${reasoningDuration}ms` : `${(reasoningDuration / 1000).toFixed(1)}s`}
                          </Text>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )}
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
          isDeepReasoning={isDeepReasoning}
          isEvaluating={isEvaluating}
          reasoningDuration={reasoningDuration}
          reasoningStartTime={reasoningStartTime}
        />

        {/* 独立的优化结果模态框 */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <ExperimentOutlined className="text-blue-500" />
              <Title level={4} className="mb-0">
                优化结果
              </Title>
            </div>
          }
          open={showResultModal}
          onCancel={() => setShowResultModal(false)}
          width={1400}
          footer={
            <div className="flex justify-end space-x-2">
              <Button size="large" onClick={() => setShowResultModal(false)}>
                关闭
              </Button>
              {optimizationResult && (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    // 应用优化结果到主界面
                    setShowResultModal(false);
                  }}
                >
                  应用结果
                </Button>
              )}
            </div>
          }
          destroyOnClose={false}
          maskClosable={false}
        >
          {/* 左右布局优化结果展示 */}
          {isOptimizing || optimizationResult ? (
            <div className="space-y-4">
              {/* 进度提示 */}
              {isOptimizing && (
                <Alert
                  message={
                    <div className="flex items-center space-x-2">
                      <Spin size="small" />
                      <span>正在优化您的提示词，请耐心等待...</span>
                    </div>
                  }
                  type="info"
                  showIcon={false}
                  className="mb-4"
                />
              )}

              {/* 深度推理单独显示区域 */}
              {(streamingContent?.deepReasoning || optimizationResult?.deepReasoning) && (
                <Card
                  size="small"
                  title={
                    <div className="flex items-center space-x-2">
                      <BulbOutlined className="text-orange-500" />
                      <span>深度推理过程</span>
                      {isOptimizing && !streamingContent?.optimizedPrompt && (
                        <Badge status="processing" text="思考中..." />
                      )}
                    </div>
                  }
                  className="mb-4"
                >
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <ModalMarkdown>
                      {streamingContent?.deepReasoning || optimizationResult?.deepReasoning || ""}
                    </ModalMarkdown>
                    {isOptimizing && !streamingContent?.optimizedPrompt && (
                      <span className="animate-pulse">▋</span>
                    )}
                  </div>
                </Card>
              )}

              {/* 左右分栏布局：优化后提示词 + 评估结果 */}
              <Row gutter={[16, 16]}>
                {/* 左侧：优化后的提示词 */}
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    title={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileTextOutlined className="text-blue-500" />
                          <span>优化后的提示词</span>
                          {isOptimizing && streamingContent?.deepReasoning && !streamingContent?.optimizedPrompt && (
                            <Badge status="processing" text="生成中..." />
                          )}
                        </div>
                        {(streamingContent?.optimizedPrompt || optimizationResult?.optimizedPrompt) && (
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => {
                              const content = streamingContent?.optimizedPrompt || optimizationResult?.optimizedPrompt || "";
                              navigator.clipboard.writeText(content);
                              message.success("优化后的提示词已复制到剪贴板");
                            }}
                          >
                            复制
                          </Button>
                        )}
                      </div>
                    }
                    className="h-96"
                    bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
                  >
                    {streamingContent?.optimizedPrompt || optimizationResult?.optimizedPrompt ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-full overflow-auto">
                        <ModalMarkdown>
                          {streamingContent?.optimizedPrompt || optimizationResult?.optimizedPrompt || ""}
                        </ModalMarkdown>
                        {isOptimizing && streamingContent?.deepReasoning && !streamingContent?.optimizedPrompt && (
                          <span className="animate-pulse">▋</span>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <FileTextOutlined className="text-4xl text-gray-400 mb-2" />
                          <Text type="secondary">等待生成优化后的提示词...</Text>
                        </div>
                      </div>
                    )}
                  </Card>
                </Col>

                {/* 右侧：评估结果 */}
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    title={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BarChartOutlined className="text-green-500" />
                          <span>优化评估报告</span>
                          {isOptimizing && streamingContent?.optimizedPrompt && !streamingContent?.evaluation && (
                            <Badge status="processing" text="评估中..." />
                          )}
                        </div>
                        {(streamingContent?.evaluation || optimizationResult?.evaluation) && (
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => {
                              const content = streamingContent?.evaluation || optimizationResult?.evaluation || "";
                              navigator.clipboard.writeText(content);
                              message.success("评估报告已复制到剪贴板");
                            }}
                          >
                            复制
                          </Button>
                        )}
                      </div>
                    }
                    className="h-96"
                    bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
                  >
                    {streamingContent?.evaluation || optimizationResult?.evaluation ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-full overflow-auto">
                        <ModalMarkdown>
                          {streamingContent?.evaluation || optimizationResult?.evaluation || ""}
                        </ModalMarkdown>
                        {isOptimizing && streamingContent?.optimizedPrompt && !streamingContent?.evaluation && (
                          <span className="animate-pulse">▋</span>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <BarChartOutlined className="text-4xl text-gray-400 mb-2" />
                          <Text type="secondary">等待生成评估报告...</Text>
                        </div>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>

              {/* 完成状态提示 */}
              {optimizationResult && !isOptimizing && (
                <Alert
                  message="提示词优化完成"
                  description={
                    <div>
                      <Text>
                        优化类型: {optimizationResult.optimizationType === "function-calling" ? "Function Calling" : "通用优化"}
                      </Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        完成时间: {optimizationResult.timestamp.toLocaleString()}
                      </Text>
                    </div>
                  }
                  type="success"
                  showIcon
                  className="mt-4"
                />
              )}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="text-center">
                  <Text type="secondary">开始优化后，结果将在此处实时显示</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    支持查看推理过程、优化结果和评估报告
                  </Text>
                </div>
              }
            />
          )}
        </Modal>
      </div>
    </div>
  );
}
