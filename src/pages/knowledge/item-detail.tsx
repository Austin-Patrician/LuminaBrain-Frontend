import knowledgeService from "@/api/services/knowledgeService";
import { Iconify } from "@/components/icon";
import { useParams } from "@/router/hooks";
import { usePathname, useRouter } from "@/router/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Divider,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { QAItem } from "#/entity";
import type { Knowledge } from "#/entity";


const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function KnowledgeItemDetail() {
  const { push } = useRouter();
  const { knowledgeId, itemId } = useParams();
  const navigate = useNavigate();
  const [qaData, setQaData] = useState<QAItem[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 使用 useQuery 获取知识库详情
  const {
    data: knowledge,
    isLoading: isKnowledgeLoading,
    error: knowledgeError,
  } = useQuery({
    queryKey: ["knowledge", knowledgeId],
    queryFn: async () => {
      if (!knowledgeId) {
        throw new Error("缺少知识库ID");
      }
      const response = await knowledgeService.getKnowledge(knowledgeId);
      return response;
    },
    enabled: !!knowledgeId,
  });

  // 使用 useQuery 获取知识项详情
  const {
    data: fetchedData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["knowledgeItemDetails", itemId],
    queryFn: async (): Promise<QAItem[]> => {
      if (!itemId || !knowledgeId) {
        throw new Error("缺少知识项ID或知识库ID");
      }

      const response = await knowledgeService.getKnowledgeItemPoint(
        itemId,
        knowledgeId
      );

      // 将API响应转换为QAItem格式
      const qaItems: QAItem[] = response.map((item: any) => ({
        id: item.id,
        question: item.question || "暂无问题",
        answer: item.answer || "暂无答案",
        timestamp: new Date(item.timestamp).toLocaleString("zh-CN"),
      }));
      return qaItems;

    },
    enabled: !!itemId && !!knowledgeId, // 只有当 itemId 和 knowledgeId 都存在时才执行查询
  });

  // 使用 useEffect 来处理数据更新
  useEffect(() => {
    if (fetchedData) {
      setQaData(fetchedData);
    }
  }, [fetchedData]);

  useEffect(() => {
    if (error) {
      setQaData([]);
    }
  }, [error]);

  // 添加新的QA对
  const handleAddQA = async () => {
    try {
      const values = await form.validateFields();

      if (!knowledgeId || !itemId || !knowledge?.embeddingModelID) {
        message.error("缺少必要参数，无法添加QA对");
        return;
      }

      await knowledgeService.addQaPoint({
        question: values.question,
        answer: values.answer,
        knowledgeItemId: itemId,
        knowledgeId: knowledgeId,
        embeddingAiModelId: knowledge.embeddingModelID,
      });

      setAddModalVisible(false);
      form.resetFields();
      message.success("QA对添加成功");

      // 刷新数据
      refetch();
    } catch (error) {
      message.error("添加失败，请重试");
    }
  };

  // 删除QA对
  const handleDeleteQA = async (id: string) => {
    try {
      await knowledgeService.deleteKnowledgeItemQa(id);
      message.success("QA对删除成功");
      // 删除成功后刷新页面数据
      refetch();
    } catch (error) {
      message.error("删除失败，请重试");
    }
  };

  // 取消添加QA对
  const handleCancelAdd = () => {
    setAddModalVisible(false);
    form.resetFields();
  };

  if (isLoading || isKnowledgeLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  if (error || knowledgeError) {
    return (
      <Space direction="vertical" size="large" className="w-full">
        <Card>
          <div className="flex items-center">
            <Button
              icon={<Iconify icon="material-symbols:arrow-back" />}
              onClick={() => {
                navigate(`/knowledgemanagement/knowledge/${knowledgeId}`)
              }}
            />
            <Title level={4} className="ml-4 mb-0">
              知识项详情
            </Title>
          </div>
        </Card>
        <Card>
          <Alert
            message="加载失败"
            description={
              (error instanceof Error ? error.message : "") ||
              (knowledgeError instanceof Error ? knowledgeError.message : "") ||
              "获取数据失败"
            }
            type="error"
            showIcon
          />
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
              onClick={() => navigate(`/knowledgemanagement/knowledge/${knowledgeId}`)}
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
                onClick={(e) => {
                  e.currentTarget.blur();
                  setAddModalVisible(true);
                }}
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
            renderItem={(item) => (
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
