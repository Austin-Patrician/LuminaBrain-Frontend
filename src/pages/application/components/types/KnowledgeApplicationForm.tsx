import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Row,
  Col,
  Card,
  Typography,
  Slider,
  Tooltip,
  Space,
  message,
  theme,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { AiModelItem } from "#/entity";
import { useTranslation } from "react-i18next";
import applicationService from "@/api/services/applicationService";

const { TextArea } = Input;
const { Text } = Typography;

// AI模型类型ID常量
const MODEL_TYPE_IDS = {
  CHAT: "0D826A41-45CE-4870-8893-A8D4FAECD3A4",
  IMAGE: "944ABBC8-1611-4E29-9EC8-F9A11BAD7709",
  EMBEDDING: "F37AF2F3-37A1-418B-8EEE-3675A5A36784",
  RERANK: "F8AC00C2-F4E7-4FC3-8677-CF8AE86CE23F",
};

interface KnowledgeApplicationFormProps {
  form: any;
}

const KnowledgeApplicationForm: React.FC<KnowledgeApplicationFormProps> = ({
  form,
}) => {
  const { t } = useTranslation();
  const [chatModels, setChatModels] = useState<AiModelItem[]>([]);
  const [imageModels, setImageModels] = useState<AiModelItem[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<AiModelItem[]>([]);
  const [rerankModels, setRerankModels] = useState<AiModelItem[]>([]);
  const [knowledgeList, setKnowledgeList] = useState<
    { value: string; label: string }[]
  >([]);
  const { token } = theme.useToken();

  // 温度和TopP标记点
  const temperatureMarks = {
    0: <Text>确定</Text>,
    0.6: <Text>均衡</Text>,
    1: <Text>发散</Text>,
  };

  const topPMarks = {
    0: <Text type="secondary">低</Text>,
    0.8: <Text type="secondary">均衡</Text>,
    1: <Text type="secondary">高</Text>,
  };

  const formatTooltip = (value?: number) => value?.toFixed(2);

  const cardStyle = {
    marginBottom: 16,
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
    border: `1px solid ${token.colorBorderSecondary}`,
  };

  const cardHeadStyle = {
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    padding: "12px 18px",
    fontWeight: 500,
  };

  const cardBodyStyle = {
    padding: "18px",
  };

  // 加载模型数据
  useEffect(() => {
    const loadModels = async () => {
      try {
        const chatModelRes = await applicationService.getAiModelsByTypeId(
          MODEL_TYPE_IDS.CHAT
        );
        setChatModels(chatModelRes);

        const imageModelRes = await applicationService.getAiModelsByTypeId(
          MODEL_TYPE_IDS.IMAGE
        );
        setImageModels(imageModelRes);

        const embeddingModelRes = await applicationService.getAiModelsByTypeId(
          MODEL_TYPE_IDS.EMBEDDING
        );
        setEmbeddingModels(embeddingModelRes);

        const rerankModelRes = await applicationService.getAiModelsByTypeId(
          MODEL_TYPE_IDS.RERANK
        );
        setRerankModels(rerankModelRes);

        const knowledgeRes = await applicationService.GetKnowledgeList();
        const formattedKnowledgeList = knowledgeRes.map((item) => ({
          value: item.knowledgeId,
          label: item.knowledgeName,
        }));
        setKnowledgeList(formattedKnowledgeList);
      } catch (error) {
        console.error("加载模型数据失败", error);
        message.error(t("加载模型数据失败"));
      }
    };

    loadModels();
  }, [t]);

  return (
    <div>
      {/* 基本信息 */}
      <Card
        title={t("基本应用信息")}
        bordered={false}
        style={cardStyle}
        headStyle={cardHeadStyle}
        bodyStyle={cardBodyStyle}
      >
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={t("应用名称")}
              rules={[{ required: true, message: t("请输入应用名称") }]}
            >
              <Input placeholder={t("请输入应用名称")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="icon" label={t("应用图标")}>
              <Input placeholder={t("请输入图标URL")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="needModelSupport"
              label={t("需要模型支持")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label={t("应用描述")}>
              <TextArea rows={3} placeholder={t("请输入应用描述")} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 知识库配置 */}
      <Card
        title={t("知识库配置")}
        bordered={false}
        style={cardStyle}
        headStyle={cardHeadStyle}
        bodyStyle={cardBodyStyle}
      >
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Form.Item
              name="knowledgeIds"
              label={t("选择知识库")}
              rules={[{ required: true, message: t("请选择知识库") }]}
            >
              <Select
                mode="multiple"
                placeholder={t("请选择知识库")}
                options={knowledgeList}
                maxTagCount={5}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 模型配置 */}
      <Card
        title={t("模型配置")}
        bordered={false}
        style={cardStyle}
        headStyle={cardHeadStyle}
        bodyStyle={cardBodyStyle}
      >
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              name="chatModelId"
              label={t("聊天模型")}
              rules={[{ required: true, message: t("请选择聊天模型") }]}
            >
              <Select placeholder={t("请选择聊天模型")}>
                {chatModels.map((model) => (
                  <Select.Option key={model.aiModelId} value={model.aiModelId}>
                    {model.aiModelName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="embeddingModelId"
              label={t("嵌入模型")}
              rules={[{ required: true, message: t("请选择嵌入模型") }]}
            >
              <Select placeholder={t("请选择嵌入模型")} allowClear>
                {embeddingModels.map((model) => (
                  <Select.Option key={model.aiModelId} value={model.aiModelId}>
                    {model.aiModelName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="rerankModelID" label={t("重排序模型")}>
              <Select placeholder={t("请选择重排序模型")} allowClear>
                {rerankModels.map((model) => (
                  <Select.Option key={model.aiModelId} value={model.aiModelId}>
                    {model.aiModelName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="imageModelID" label={t("图像模型")}>
              <Select placeholder={t("请选择图像模型")} allowClear>
                {imageModels.map((model) => (
                  <Select.Option key={model.aiModelId} value={model.aiModelId}>
                    {model.aiModelName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxResponseTokens"
              label={t("最大响应Token数")}
              initialValue={8000}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxRequestTokens"
              label={t("最大请求Token数")}
              initialValue={3000}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 检索配置 */}
      <Card
        title={t("检索配置")}
        bordered={false}
        style={cardStyle}
        headStyle={cardHeadStyle}
        bodyStyle={cardBodyStyle}
      >
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item name="matchCount" label={t("匹配数量")} initialValue={1}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="relevance"
              label={
                <Space>
                  {t("相关性")}
                  <Tooltip title={t("控制匹配结果的相关性阈值")}>
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              initialValue={0.7}
            >
              <Slider
                min={0}
                max={1}
                step={0.01}
                marks={{
                  0: t("低"),
                  0.5: t("中"),
                  1: t("高"),
                }}
                tooltip={{ formatter: formatTooltip }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 参数配置 */}
      <Card
        title={t("参数配置")}
        bordered={false}
        style={cardStyle}
        headStyle={cardHeadStyle}
        bodyStyle={cardBodyStyle}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="temperature"
              label={
                <Space>
                  {t("温度")}
                  <Tooltip
                    title={t("控制生成文本的创造性和多样性，值越高结果越随机")}
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              initialValue={0.7}
            >
              <Slider
                min={0}
                max={1}
                step={0.01}
                marks={temperatureMarks}
                tooltip={{ formatter: formatTooltip }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="topP"
              label={
                <Space>
                  {t("Top P")}
                  <Tooltip
                    title={t("控制生成文本的词汇多样性，值越高考虑的词越多")}
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              initialValue={0.8}
            >
              <Slider
                min={0}
                max={1}
                step={0.01}
                marks={topPMarks}
                tooltip={{ formatter: formatTooltip }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="frequencyPenalty"
              label={
                <Space>
                  {t("频率惩罚")}
                  <Tooltip title={t("减少重复内容生成的可能性")}>
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              initialValue={0}
            >
              <Slider
                min={0}
                max={2}
                step={0.01}
                marks={{
                  0: t("无"),
                  1: t("中"),
                  2: t("强"),
                }}
                tooltip={{ formatter: formatTooltip }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="presencePenalty"
              label={
                <Space>
                  {t("存在惩罚")}
                  <Tooltip title={t("增加模型讨论新主题的可能性")}>
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              initialValue={0}
            >
              <Slider
                min={0}
                max={2}
                step={0.01}
                marks={{
                  0: t("无"),
                  1: t("中"),
                  2: t("强"),
                }}
                tooltip={{ formatter: formatTooltip }}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="promptWord" label={t("提示词")}>
              <TextArea
                rows={3}
                placeholder={t("请输入提示词")}
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 功能开关 */}
      <Card
        title={t("功能开关")}
        bordered={false}
        style={cardStyle}
        headStyle={cardHeadStyle}
        bodyStyle={cardBodyStyle}
      >
        <Row gutter={[24, 16]}>
          <Col span={8}>
            <Form.Item
              name="isSummary"
              label={t("启用摘要")}
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isRerank"
              label={t("启用重排序")}
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default KnowledgeApplicationForm;
