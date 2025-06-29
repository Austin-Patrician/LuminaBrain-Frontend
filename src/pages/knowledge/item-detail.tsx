import { useParams } from "@/router/hooks";
import { useNavigate } from "react-router";
import {
  Card,
  Typography,
  Button,
  Space,
  List,
  Tag,
  Divider,
  Alert,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from "antd";
import { Iconify } from "@/components/icon";
import { useState, useEffect } from "react";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Q&A 数据类型定义
interface QAItem {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

// Mock API 响应数据
const mockApiResponse = {
  success: true,
  data: [
    {
      id: "1",
      question: "什么是人工智能？",
      answer:
        "人工智能（Artificial Intelligence，简称AI）是计算机科学的一个分支，它试图理解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。人工智能研究的领域包括机器学习、深度学习、自然语言处理、计算机视觉等。",
      timestamp: "2024-01-15 10:30:00",
    },
    {
      id: "2",
      question: "机器学习和深度学习有什么区别？",
      answer:
        "机器学习是人工智能的一个子集，它使计算机能够在没有明确编程的情况下学习。深度学习是机器学习的一个子集，它使用具有多个层（深层神经网络）的神经网络来模拟人脑的工作方式。深度学习在图像识别、语音识别和自然语言处理等领域表现出色。",
      timestamp: "2024-01-15 11:45:00",
    },
    {
      id: "3",
      question: "如何开始学习人工智能？",
      answer:
        "学习人工智能可以从以下几个步骤开始：1. 掌握数学基础（线性代数、概率论、统计学）；2. 学习编程语言（Python、R）；3. 了解机器学习基础概念；4. 实践项目和案例；5. 深入学习深度学习框架（TensorFlow、PyTorch）；6. 持续关注最新技术发展。",
      timestamp: "2024-01-15 14:20:00",
    },
    {
      id: "4",
      question: "什么是自然语言处理？",
      answer:
        "自然语言处理（Natural Language Processing，简称NLP）是人工智能的一个重要分支，旨在让计算机能够理解、解释和生成人类语言。NLP的应用包括机器翻译、情感分析、文本摘要、问答系统、语音识别等。现代NLP技术广泛使用深度学习模型，如Transformer架构。",
      timestamp: "2024-01-15 16:10:00",
    },
    {
      id: "5",
      question: "AI在日常生活中有哪些应用？",
      answer:
        "AI在日常生活中的应用非常广泛：1. 智能手机的语音助手（Siri、Google Assistant）；2. 推荐系统（Netflix、YouTube、淘宝）；3. 导航和地图服务；4. 搜索引擎优化；5. 在线翻译服务；6. 智能家居设备；7. 医疗诊断辅助；8. 金融风控和投资建议；9. 自动驾驶汽车；10. 客服聊天机器人。",
      timestamp: "2024-01-15 17:30:00",
    },
  ],
};

// Mock API 调用函数
const fetchKnowledgeItemDetails = async (itemId: string): Promise<QAItem[]> => {
  console.log(`正在获取知识项详情，itemId: ${itemId}`);

  // 模拟 API 请求延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (mockApiResponse.success) {
    return mockApiResponse.data;
  } else {
    throw new Error("获取数据失败");
  }
};

export default function KnowledgeItemDetail() {
  const { knowledgeId, itemId } = useParams();
  const navigate = useNavigate();
  const [qaData, setQaData] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 页面加载时获取数据
  useEffect(() => {
    const loadData = async () => {
      if (!itemId) {
        setError("缺少知识项ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchKnowledgeItemDetails(itemId);
        setQaData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取数据失败");
        setQaData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [itemId]);

  const onBackClick = () => {
    navigate(`/knowledgemanagement/${knowledgeId}`);
  };

  // 添加新的QA对
  const handleAddQA = () => {
    form
      .validateFields()
      .then((values) => {
        const newQA: QAItem = {
          id: (qaData.length + 1).toString(),
          question: values.question,
          answer: values.answer,
          timestamp: new Date().toLocaleString("zh-CN"),
        };

        setQaData([...qaData, newQA]);
        setAddModalVisible(false);
        form.resetFields();
        message.success("QA对添加成功");
      })
      .catch((errorInfo) => {
        console.log("表单验证失败:", errorInfo);
      });
  };

  // 删除QA对
  const handleDeleteQA = (id: string) => {
    const updatedData = qaData.filter((item) => item.id !== id);
    setQaData(updatedData);
    message.success("QA对删除成功");
  };

  // 取消添加QA对
  const handleCancelAdd = () => {
    setAddModalVisible(false);
    form.resetFields();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载知识项详情中..." />
      </div>
    );
  }

  if (error) {
    return (
      <Space direction="vertical" size="large" className="w-full">
        <Card>
          <div className="flex items-center">
            <Button
              icon={<Iconify icon="material-symbols:arrow-back" />}
              onClick={onBackClick}
            />
            <Title level={4} className="ml-4 mb-0">
              知识项详情
            </Title>
          </div>
        </Card>
        <Card>
          <Alert message="加载失败" description={error} type="error" showIcon />
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" className="w-full">
      {/* 页面头部 */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              icon={<Iconify icon="material-symbols:arrow-back" />}
              onClick={onBackClick}
            />
            <Title level={4} className="ml-4 mb-0">
              知识项详情
            </Title>
          </div>
          <div className="flex items-center space-x-2">
            <Tag color="blue">知识库ID: {knowledgeId}</Tag>
            <Tag color="green">项目ID: {itemId}</Tag>
          </div>
        </div>
      </Card>

      {/* Q&A 列表 */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span>问答内容</span>
            <div className="flex items-center space-x-3">
              <Text type="secondary" className="text-sm font-normal">
                共 {qaData.length} 条问答
              </Text>
              <Button
                type="primary"
                size="small"
                icon={<Iconify icon="material-symbols:add" />}
                onClick={() => setAddModalVisible(true)}
              >
                新增QA对
              </Button>
            </div>
          </div>
        }
      >
        {qaData.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={qaData}
            split={false}
            className="qa-list"
            renderItem={(item, index) => (
              <List.Item className="!p-0 !border-none">
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200 relative">
                  {/* 删除按钮 */}
                  <div className="absolute top-4 right-4">
                    <Popconfirm
                      title="删除QA对"
                      description="确定要删除这个QA对吗？"
                      onConfirm={() => handleDeleteQA(item.id)}
                      okText="确定"
                      cancelText="取消"
                      placement="topRight"
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={
                          <Iconify icon="material-symbols:delete-outline" />
                        }
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      />
                    </Popconfirm>
                  </div>

                  {/* 问题部分 */}
                  <div className="mb-4 pr-8">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <Text strong className="text-blue-600 text-sm">
                          Q
                        </Text>
                      </div>
                      <Text strong className="text-lg text-gray-800">
                        {item.question}
                      </Text>
                    </div>
                  </div>

                  <Divider className="my-4" />

                  {/* 答案部分 */}
                  <div className="mb-4 pr-8">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mt-1">
                        <Text strong className="text-green-600 text-sm">
                          A
                        </Text>
                      </div>
                      <div className="flex-1">
                        <Paragraph className="text-gray-700 leading-relaxed mb-0">
                          {item.answer}
                        </Paragraph>
                      </div>
                    </div>
                  </div>

                  {/* 底部时间信息 */}
                  <div className="flex items-center pt-4 mt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Iconify icon="material-symbols:schedule" size={14} />
                      <Text className="text-xs">{item.timestamp}</Text>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center py-12">
            <Empty
              description="暂无问答数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>

      {/* 添加QA对的模态框 */}
      <Modal
        title="新增QA对"
        open={addModalVisible}
        onOk={handleAddQA}
        onCancel={handleCancelAdd}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="question"
            label="问题"
            rules={[
              { required: true, message: "请输入问题" },
              { min: 5, message: "问题至少需要5个字符" },
            ]}
          >
            <TextArea
              placeholder="请输入问题内容"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>

          <Form.Item
            name="answer"
            label="答案"
            rules={[
              { required: true, message: "请输入答案" },
              { min: 10, message: "答案至少需要10个字符" },
            ]}
          >
            <TextArea
              placeholder="请输入答案内容"
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
