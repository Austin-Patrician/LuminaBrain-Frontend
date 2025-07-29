import { useParams } from "@/router/hooks";
import { usePathname, useRouter } from "@/router/hooks";
import { DownloadOutlined, InboxOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
// 添加apiClient导入
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Space,
  Spin,
  Steps,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import type { MenuProps, UploadProps } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import knowledgeService from "@/api/services/knowledgeService";
import { Iconify } from "@/components/icon";

// 导入样式文件
import "./index.css";
import { V } from "node_modules/react-router/dist/development/fog-of-war-D2zsXvum.d.mts";


const { Title, Paragraph } = Typography;
const { Search, TextArea } = Input;
const { Dragger } = Upload;

// 导入类型枚举
enum ImportType {
  FILE = "3f8b38d6-f321-4d1a-89c0-93d7a5023a2c",
  LINK = "47c5ab88-65e4-4ea8-a214-b384b9d37d27",
  TEXT = "d6a6eeb2-79d9-4a5f-8f1b-f2c9a7c4d2b0",
  QA = "c18b1f8a-4e70-49e5-b7cc-59af73c3bc6a",
}

// 切分类型枚举
enum SplitType {
  DIRECT = "direct",
  QA = "qa",
}

// 添加文本省略显示的公共渲染函数
const EllipsisText = ({ text }: { text: string }) => (
  <Tooltip title={text} placement="topLeft">
    <div className="truncate">{text}</div>
  </Tooltip>
);

// 更新模板下载组件，使其更美观


// 添加QA导入指引组件
const QAImportGuide = () => (
  <div className="qa-import-steps">
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">1</span>
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">下载模板</div>
          <div className="text-sm text-gray-600">选择您熟悉的格式，下载对应的QA数据模板</div>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 font-semibold text-sm">2</span>
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">填写数据</div>
          <div className="text-sm text-gray-600">按照模板格式填写您的问题和答案对</div>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-purple-600 font-semibold text-sm">3</span>
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">上传文件</div>
          <div className="text-sm text-gray-600">将填写好的文件拖拽到上传区域或点击上传</div>
        </div>
      </div>
    </div>
  </div>
);

// 验证URL的正则表达式
const URL_REGEX =
  /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

export default function KnowledgeDetail() {
  const { push } = useRouter();
  const pathname = usePathname();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importType, setImportType] = useState<ImportType>(ImportType.FILE);
  const [splitType, setSplitType] = useState<SplitType>(SplitType.QA); // 默认QA切分
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 获取知识库详情
  const { data: knowledgeResponse, isLoading: isLoadingKnowledge } = useQuery({
    queryKey: ["knowledge", id],
    queryFn: () => knowledgeService.getKnowledge(id as string),
    enabled: !!id,
  });

  // 从返回数据中提取知识库详情和知识项列表
  const knowledge = knowledgeResponse;
  const knowledgeItems = knowledge?.knowledgeItems || [];

  // 搜索测试功能
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["knowledgeSearch", id, searchQuery],
    queryFn: () => {
      // 实际搜索API调用
      return Promise.resolve({ data: [] });
    },
    enabled: !!id && !!searchQuery && activeTab === "2",
  });

  const onSearch = (value: string) => {
    console.log(value);
    setSearchQuery(value);
  };

  const onBackClick = () => {
    navigate(-1);
  };

  // 重置导入表单和状态
  const resetImportState = () => {
    setSplitType(SplitType.QA); // 重置为QA切分
    form.resetFields();
  };

  // 处理导入菜单点击
  const handleImportMenuClick: MenuProps["onClick"] = (e) => {
    setImportType(e.key as ImportType);
    setSplitType(SplitType.QA); // 固定设置为QA切分
    form.resetFields();
    setImportModalVisible(true);
  };

  // 关闭导入模态框
  const handleImportCancel = () => {
    setImportModalVisible(false);
    resetImportState();
  };

  // 修正文件上传处理逻辑
  const uploadFileMutation = useMutation({
    mutationFn: async ({
      file,
      knowledgeId,
      splitType,
      importType,
      data,
    }: {
      file?: File;
      knowledgeId: string;
      splitType: SplitType;
      importType: ImportType;
      data?: string;
    }) => {
      try {
        // 1. 获取CSRF令牌
        const tokenResponse = await knowledgeService.getAntiforgerytoken();
        const csrfToken = tokenResponse;

        // 2. 准备FormData - 确保字段名称与后端期望的完全匹配
        const formData = new FormData();

        // 根据不同导入类型添加不同的数据
        if (importType === ImportType.FILE || importType === ImportType.QA) {
          // 文件上传类型
          if (!file) throw new Error("File is required for file upload");
          formData.append("formFile", file);
        } else if (data) {
          // 链接或文本导入类型，将数据添加到data字段
          formData.append("data", data);
          console.log(
            "准备导入数据类型:",
            importType,
            "数据长度:",
            data.length
          );
        }

        // 添加共通字段
        formData.append("splitType", splitType); // 切分方式
        formData.append("importType", importType); // 导入类型

        // 3. 设置headers
        const headers = {
          "Content-Type": "multipart/form-data",
        };

        // 4. 调用上传API，knowledgeId作为路由参数传递
        return await knowledgeService.uploadFile(
          knowledgeId,
          formData,
          headers
        );
      } catch (error) {
        console.error("Upload file error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      message.success("导入成功");
      queryClient.invalidateQueries({ queryKey: ["knowledge", id] }); // 刷新知识库详情
    },
    onError: (error) => {
      message.error(`导入失败: ${error}`);
    },
  });

  // 自定义上传请求 - 更新以传递导入类型
  const customUploadRequest = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;

    try {
      // 显示上传进度
      onProgress({ percent: 0 });

      // 调用上传mutation
      const result = await uploadFileMutation.mutateAsync({
        file,
        knowledgeId: id as string,
        splitType: SplitType.QA, // 固定使用QA切分
        importType: ImportType.FILE, // 这里是文件上传，固定为FILE类型
        data: undefined,
      });

      // 完成进度
      onProgress({ percent: 100 });
      onSuccess();
    } catch (error: any) {
      console.error("上传失败:", error);
      // 提供更详细的错误信息
      const errorMessage = error.response
        ? `错误 ${error.response.status}: ${error.response.statusText}`
        : error.message || "未知错误";
      onError(new Error(errorMessage));
    }
  };

  // 更新文件上传配置 - 修改为单文件上传
  const uploadProps: UploadProps = {
    name: "formFile",
    multiple: false, // 修改为false，只支持单文件
    maxCount: 1, // 限制最多只能上传1个文件
    customRequest: customUploadRequest,
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} 文件上传成功。`);
      } else if (status === "error") {
        message.error(`${info.file.name} 文件上传失败。`);
      }
    },
    onDrop(e) {
      // 如果用户尝试拖拽多个文件，只处理第一个
      if (e.dataTransfer.files.length > 1) {
        message.warning("每次只能上传一个文件");
      }
      console.log("Dropped file:", e.dataTransfer.files[0]);
    },
    accept:
      importType === ImportType.FILE
        ? ".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.ppt,.pptx"
        : importType === ImportType.QA
          ? ".csv,.xlsx,.json"
          : undefined,
    // 不再设置action属性，因为我们使用customRequest
  };

  // 添加文件上传文本提示
  const renderUploadHint = () => {
    if (importType === ImportType.FILE) {
      return "支持上传单个文件。支持 PDF, Word, TXT, CSV, Excel, PPT 等格式。";
    }
    if (importType === ImportType.QA) {
      return "支持上传单个QA文件，支持CSV、Excel或JSON格式，请确保文件结构符合模板要求。";
    }
    return "";
  };

  // 提交导入 - 修改以处理链接和文本导入
  const handleImportSubmit = () => {
    form.validateFields().then((values) => {
      // 不同的导入类型有不同的处理逻辑
      if (importType === ImportType.LINK) {
        // 处理链接导入

        if (values.links.length > 0) {
          uploadFileMutation.mutate({
            knowledgeId: id as string,
            splitType: SplitType.QA, // 固定使用QA切分
            importType: ImportType.LINK,
            data: values.links, // 将链接数组转为JSON字符串
          });
        } else {
          message.error("请输入至少一个有效的链接");
          return;
        }
      } else if (importType === ImportType.TEXT) {
        // 处理文本导入
        if (values.content) {
          uploadFileMutation.mutate({
            knowledgeId: id as string,
            splitType: SplitType.QA, // 固定使用QA切分
            importType: ImportType.TEXT,
            data: values.content,
          });
        } else {
          message.error("请输入文本内容");
          return;
        }
      }
      // 文件上传通过Upload组件的customRequest处理

      setImportModalVisible(false);
      resetImportState();
    });
  };

  // 导入菜单项
  const importItems: MenuProps["items"] = [
    {
      key: ImportType.FILE,
      label: "文件导入",
      icon: <Iconify icon="ic:round-file-upload" />,
    },
    {
      key: ImportType.LINK,
      label: "链接导入",
      icon: <Iconify icon="mdi:link-variant" />,
    },
    {
      key: ImportType.TEXT,
      label: "文本导入",
      icon: <Iconify icon="material-symbols:text-snippet" />,
    },
    {
      key: ImportType.QA,
      label: "QA导入",
      icon: <Iconify icon="mdi:comment-question" />,
    },
  ];

  // 知识项表格列定义 - 缩小行宽
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      ellipsis: true,
      render: (text: string) => (
        <div className="knowledge-item-id">
          <EllipsisText text={text} />
        </div>
      ),
    },
    {
      title: "数据内容",
      dataIndex: "data",
      key: "data",
      width: 180, // 减小列宽
      ellipsis: true,
      render: (text: string) => (
        <div className="knowledge-item-data-cell">
          <Tooltip title={text} placement="topLeft">
            <div className="knowledge-item-data-preview">
              {text
                ? text.substring(0, 50) + (text.length > 50 ? "..." : "")
                : "无内容"}
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "文件ID",
      dataIndex: "fileId",
      key: "fileId",
      width: 80,
      ellipsis: true,
      render: (text: string) => (
        <div className="knowledge-item-id">
          <EllipsisText text={text} />
        </div>
      ),
    },
    {
      title: "数据量",
      dataIndex: "dataCount",
      key: "dataCount",
      width: 60,
      align: "center",
      render: (count: number) => (
        <span className="knowledge-item-count-simple">{count || 0}</span>
      ),
    },
    {
      title: "导入类型",
      dataIndex: "importType",
      key: "importType",
      width: 90,
      render: (type: string) => {
        const getImportTypeInfo = (importType: string) => {
          switch (importType) {
            case "3f8b38d6-f321-4d1a-89c0-93d7a5023a2c":
              return { text: "文件", icon: "📁", className: "type-file" };
            case "47c5ab88-65e4-4ea8-a214-b384b9d37d27":
              return { text: "链接", icon: "🔗", className: "type-link" };
            case "d6a6eeb2-79d9-4a5f-8f1b-f2c9a7c4d2b0":
              return { text: "文本", icon: "📝", className: "type-text" };
            case "c18b1f8a-4e70-49e5-b7cc-59af73c3bc6a":
              return { text: "QA", icon: "💭", className: "type-qa" };
            default:
              return { text: "未知", icon: "❓", className: "type-file" };
          }
        };

        const typeInfo = getImportTypeInfo(type);
        return (
          <div className={`knowledge-item-import-type ${typeInfo.className}`}>
            <span>{typeInfo.icon}</span>
            {typeInfo.text}
          </div>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "knowledgeItemStatus",
      key: "knowledgeItemStatus",
      width: 80,
      render: (status: string) => {
        const getStatusClass = (status: string) => {
          switch (status) {
            case "可用":
              return "status-available";
            case "处理中":
              return "status-processing";
            case "失败":
              return "status-failed";
            default:
              return "status-default";
          }
        };

        return (
          <div className={`knowledge-item-status ${getStatusClass(status)}`}>
            {status}
          </div>
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "creationTime",
      key: "creationTime",
      width: 100,
      render: (time: string) => {
        const formattedTime = new Date(time).toLocaleString("zh-CN", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return <div className="knowledge-item-time">{formattedTime}</div>;
      },
    },
    {
      title: "QA",
      dataIndex: "isQA",
      key: "isQA",
      width: 60,
      render: (isQA: boolean) => (
        <div
          className={`knowledge-item-qa-indicator ${isQA ? "is-qa" : "not-qa"}`}
        >
          {isQA ? "QA" : "普通"}
        </div>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record: any) => (
        <div className="knowledge-item-actions">
          <Tooltip title="查看详情">
            <button
              type="button"
              className="knowledge-item-action-btn view-btn"
              onClick={() => handleView(record)}
            >
              <Iconify icon="solar:eye-bold-duotone" size={14} />
            </button>
          </Tooltip>
          <Popconfirm
            title="确定要删除吗？"
            description="删除后无法恢复，请谨慎操作"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            placement="topRight"
          >
            <Tooltip title="删除">
              <button type="button" className="knowledge-item-action-btn delete-btn">
                <Iconify icon="mingcute:delete-2-fill" size={14} />
              </button>
            </Tooltip>
          </Popconfirm>
          <Tooltip title="重新执行">
            <button
              type="button"
              className="knowledge-item-action-btn reprocess-btn"
              onClick={() => handleReprocess(record.id)}
            >
              <Iconify icon="mdi:reload" size={14} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  // 重新执行知识项
  const reprocessKnowledgeItemMutation = useMutation({
    mutationFn: knowledgeService.reprocessKnowledgeItem,
    onSuccess: () => {
      message.success("重新执行成功");
      queryClient.invalidateQueries({ queryKey: ["knowledge", id] }); // 刷新知识库详情
    },
    onError: (error) => {
      message.error(`重新执行失败: ${error}`);
    },
  });

  // 处理重新执行
  const handleReprocess = async (itemId: string) => {
    try {
      await reprocessKnowledgeItemMutation.mutateAsync(itemId);
    } catch (error) {
      console.error("Reprocess error:", error);
    }
  };

  // 处理查看详情
  const handleView = (record: any) => {
    push(`${pathname}/item/${record.id}`);
  };

  // 删除知识项
  const handleDelete = async (itemId: string) => {
    try {
      // 这里需要添加删除知识项的API调用
      await knowledgeService.deleteKnowledgeItem(itemId);
      message.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["knowledge", id] }); // 刷新知识库详情
    } catch (error) {
      message.error(`删除失败: ${error}`);
    }
  };

  // 渲染导入模态框内容
  const renderImportModalContent = () => {
    switch (importType) {
      case ImportType.FILE:
        return (
          <div className="import-form-container">
            <Alert
              message="文件导入说明"
              description="每次只能上传一个文件，如需批量导入，请分别上传。系统将使用QA切分方式处理文件内容。"
              type="info"
              showIcon
              className="mb-6 import-tip-alert"
              style={{
                backgroundColor: "#f0f9ff",
                borderColor: "#0ea5e9",
                fontSize: "0.9rem",
              }}
            />

            <Form.Item name="files">
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">{renderUploadHint()}</p>
              </Dragger>
            </Form.Item>
          </div>
        );

      case ImportType.LINK:
        return (
          <div className="import-form-container">
            <Alert
              message="链接导入说明"
              description="请输入有效的网页链接，系统将自动抓取网页内容并使用QA切分方式进行处理。"
              type="info"
              showIcon
              className="mb-4"
              style={{
                backgroundColor: "#f0f9ff",
                borderColor: "#0ea5e9",
                fontSize: "0.9rem",
              }}
            />

            <Form.Item
              name="links"
              label="链接地址"
              className="mt-4"
              rules={[
                { required: true, message: "请输入至少一个链接地址" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const urls = value.split("\n").filter((url) => url.trim());
                    const invalidUrls = urls.filter(
                      (url) => !URL_REGEX.test(url.trim())
                    );

                    if (invalidUrls.length > 0) {
                      return Promise.reject(
                        `发现无效的URL格式: ${invalidUrls
                          .slice(0, 2)
                          .join(", ")}${invalidUrls.length > 2 ? "等" : ""}`
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              extra="示例: https://example.com/page"
            >
              <TextArea
                placeholder="请输入网页URL，如：
https://example.com/page1"
                autoSize={{ minRows: 3, maxRows: 6 }}
                className="link-import-textarea"
              />
            </Form.Item>

            <div className="import-url-examples">
              <Title level={5} className="mb-2">
                支持的链接类型
              </Title>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Card size="small" className="import-url-example-card">
                  <div className="text-sm font-medium">✅ 支持</div>
                  <ul className="mt-1 text-xs text-gray-600 pl-4">
                    <li>公开的静态网页</li>
                    <li>博客文章</li>
                    <li>新闻页面</li>
                    <li>文档页面</li>
                  </ul>
                </Card>
                <Card size="small" className="import-url-example-card">
                  <div className="text-sm font-medium">❌ 不支持</div>
                  <ul className="mt-1 text-xs text-gray-600 pl-4">
                    <li>需要登录的页面</li>
                    <li>动态生成的内容</li>
                    <li>仅包含视频的页面</li>
                    <li>受限内容</li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        );

      case ImportType.TEXT:
        return (
          <div className="import-form-container">
            <Alert
              message="文本导入说明"
              description="直接输入或粘贴文本内容，系统将使用QA切分方式自动进行分段处理。"
              type="info"
              showIcon
              className="mb-4"
              style={{
                backgroundColor: "#f0f9ff",
                borderColor: "#0ea5e9",
                fontSize: "0.9rem",
              }}
            />

            <Form.Item
              name="content"
              label="文本内容"
              rules={[{ required: true, message: "请输入文本内容" }]}
            >
              <TextArea
                placeholder="请输入要导入的文本内容"
                autoSize={{ minRows: 6, maxRows: 12 }}
              />
            </Form.Item>
          </div>
        );

      case ImportType.QA:
        return (
          <div className="qa-import-container" style={{ padding: '8px 0' }}>
            {/* 顶部说明卡片 */}
            <Card
              size="small"
              className="mb-6"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white'
              }}
            >
              <div className="flex items-center">
                <div className="mr-3">
                  <Iconify icon="mdi:file-question-outline" size={24} />
                </div>
                <div>
                  <div className="font-semibold text-base mb-1">QA问答导入</div>
                  <div className="text-sm opacity-90">上传符合模板格式的QA文件，系统将自动处理问答数据</div>
                </div>
              </div>
            </Card>

            {/* 导入步骤和模板下载 */}
            <Row gutter={24} className="mb-6">
              <Col span={14}>
                <Card
                  title={<span className="text-base font-medium">📋 导入步骤</span>}
                  size="small"
                  className="h-full"
                  style={{ borderRadius: '8px' }}
                >
                  <QAImportGuide />
                </Card>
              </Col>
              <Col span={10}>
                <Card
                  title={<span className="text-base font-medium">📥 模板下载</span>}
                  size="small"
                  className="h-full"
                  style={{ borderRadius: '8px' }}
                >
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 mb-3">
                      选择您熟悉的格式下载模板
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        icon={<DownloadOutlined />}
                        href="/templates/qa-template.csv"
                        download="qa-template.csv"
                        type="default"
                        size="small"
                        className="text-left justify-start"
                      >
                        CSV 模板
                      </Button>
                      <Button
                        icon={<DownloadOutlined />}
                        href="/templates/qa-template.xlsx"
                        download="qa-template.xlsx"
                        type="default"
                        size="small"
                        className="text-left justify-start"
                      >
                        Excel 模板
                      </Button>
                      <Button
                        icon={<DownloadOutlined />}
                        href="/templates/qa-template.json"
                        download="qa-template.json"
                        type="default"
                        size="small"
                        className="text-left justify-start"
                      >
                        JSON 模板
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 文件上传区域 */}
            <Card
              title={<span className="text-base font-medium">📤 文件上传</span>}
              size="small"
              style={{ borderRadius: '8px' }}
            >
              <Form.Item name="files" className="mb-0">
                <Dragger
                  {...uploadProps}
                  style={{
                    background: '#fafafa',
                    border: '2px dashed #d9d9d9',
                    borderRadius: '8px',
                    padding: '20px'
                  }}
                >
                  <div className="flex flex-col items-center py-4">
                    <div className="mb-3">
                      <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    </div>
                    <div className="text-lg font-medium mb-2">点击或拖拽QA文件到此区域</div>
                    <div className="text-sm text-gray-500">{renderUploadHint()}</div>
                  </div>
                </Dragger>
              </Form.Item>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // 在 useEffect 中设置表单初始值
  useEffect(() => {
    if (importModalVisible) {
      form.setFieldsValue({
        splitTypeOption: SplitType.QA,
      });
    }
  }, [importModalVisible, form]);

  function getImportModalTitle(): React.ReactNode {
    switch (importType) {
      case ImportType.FILE:
        return "文件导入";
      case ImportType.LINK:
        return "链接导入";
      case ImportType.TEXT:
        return "文本导入";
      case ImportType.QA:
        return "QA导入";
      default:
        return "导入";
    }
  }
  return (
    <div className="knowledge-detail-container">
      {/* 页面头部 */}
      <div className="knowledge-detail-header">
        {/* 返回按钮 */}
        <Button
          type="text"
          icon={<Iconify icon="material-symbols:arrow-back" size={18} />}
          onClick={onBackClick}
          className="knowledge-back-btn"
        >
          返回
        </Button>

        {/* 知识库信息卡片 */}
        {!isLoadingKnowledge && knowledge && (
          <Card className="knowledge-header-card">
            <div className="knowledge-header-content">
              <div className="knowledge-title-section">
                <Title level={2} className="knowledge-title">
                  <Iconify icon="mdi:database-outline" className="knowledge-title-icon" />
                  {knowledge.name}
                </Title>
              </div>
              <div className="knowledge-status-badges">
                <Tag
                  className="knowledge-status-tag"
                  color={
                    knowledge.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A"
                      ? "success"
                      : "error"
                  }
                >
                  {knowledge.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A"
                    ? "运行中"
                    : "已停用"}
                </Tag>
                {knowledge.isOCR && (
                  <Tag color="processing" className="knowledge-feature-tag">
                    <Iconify icon="mdi:eye-outline" size={14} />
                    OCR识别
                  </Tag>
                )}
              </div>
              {knowledge.description && (
                <Paragraph className="knowledge-description">
                  {knowledge.description}
                </Paragraph>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* 知识库信息概览 */}
      <div className="knowledge-overview-section">
        {isLoadingKnowledge ? (
          <Card className="knowledge-loading-card">
            <div className="knowledge-loading-content">
              <Spin size="large" tip="加载知识库信息..." />
            </div>
          </Card>
        ) : !knowledge ? (
          <Card className="knowledge-error-card">
            <Empty
              description="未找到知识库数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Card className="knowledge-info-card" title="基础信息">
            <Row gutter={[16, 12]} className="knowledge-info-grid">
              <Col xs={24} sm={8} md={8} lg={8}>
                <div className="knowledge-info-item">
                  <div className="knowledge-info-label">
                    <Iconify icon="mdi:chat-outline" className="knowledge-info-icon" />
                    聊天模型
                  </div>
                  <div className="knowledge-info-value">
                    {knowledge.chatModel || "未配置"}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8} md={8} lg={8}>
                <div className="knowledge-info-item">
                  <div className="knowledge-info-label">
                    <Iconify icon="mdi:vector-triangle" className="knowledge-info-icon" />
                    嵌入模型
                  </div>
                  <div className="knowledge-info-value">
                    {knowledge.embeddingModel || "未配置"}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8} md={8} lg={8}>
                <div className="knowledge-info-item">
                  <div className="knowledge-info-label">
                    <Iconify icon="mdi:file-multiple-outline" className="knowledge-info-icon" />
                    文件数量
                  </div>
                  <div className="knowledge-info-value">
                    {knowledge.fileCount || 0} 个
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div className="knowledge-info-item">
                  <div className="knowledge-info-label">
                    <Iconify icon="mdi:text-box-outline" className="knowledge-info-icon" />
                    段落令牌
                  </div>
                  <div className="knowledge-info-value">
                    {knowledge.maxTokensPerParagraph || "未设置"}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div className="knowledge-info-item">
                  <div className="knowledge-info-label">
                    <Iconify icon="mdi:format-line-spacing" className="knowledge-info-icon" />
                    行令牌
                  </div>
                  <div className="knowledge-info-value">
                    {knowledge.maxTokensPerLine || "未设置"}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div className="knowledge-info-item">
                  <div className="knowledge-info-label">
                    <Iconify icon="mdi:layers-outline" className="knowledge-info-icon" />
                    重叠令牌
                  </div>
                  <div className="knowledge-info-value">
                    {knowledge.overlappingTokens || "未设置"}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </div>

      {/* 主要内容区域 */}
      <div className="knowledge-content-section">
        <Card className="knowledge-content-card">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="knowledge-tabs"
            size="large"
            tabBarStyle={{ marginBottom: '24px' }}
          >
            <Tabs.TabPane
              tab={
                <span className="knowledge-tab-label">
                  <Iconify icon="mdi:format-list-bulleted" className="knowledge-tab-icon" />
                  知识项列表
                </span>
              }
              key="1"
            >
              <div className="knowledge-items-section">
                <div className="knowledge-items-header">
                  <div className="knowledge-items-title">
                    <Title level={5} className="knowledge-section-title">
                      <Iconify icon="mdi:database-search" className="knowledge-section-icon" />
                      知识项管理
                    </Title>
                    <Paragraph className="knowledge-section-desc">
                      管理和查看知识库中的所有知识项内容
                    </Paragraph>
                  </div>
                  <div className="knowledge-items-actions">
                    <Dropdown
                      menu={{ items: importItems, onClick: handleImportMenuClick }}
                      placement="bottomRight"
                    >
                      <Button type="primary" size="large" className="knowledge-import-btn">
                        <Space>
                          <Iconify icon="mdi:upload" size={16} />
                          导入数据
                          <Iconify icon="mdi:chevron-down" size={16} />
                        </Space>
                      </Button>
                    </Dropdown>
                  </div>
                </div>

                <div className="knowledge-items-table-container">
                  <Table
                    columns={columns}
                    dataSource={knowledgeItems}
                    loading={isLoadingKnowledge}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据`,
                      className: 'knowledge-pagination'
                    }}
                    scroll={{ x: 1300 }}
                    size="middle"
                    className="knowledge-items-table"
                    locale={{
                      emptyText: (
                        <div className="knowledge-items-empty">
                          <Empty
                            description="暂无知识项数据"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          >
                            <Button type="primary" onClick={() => setImportModalVisible(true)}>
                              <Iconify icon="mdi:plus" className="mr-1" />
                              导入第一个知识项
                            </Button>
                          </Empty>
                        </div>
                      ),
                    }}
                  />
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={
                <span className="knowledge-tab-label">
                  <Iconify icon="mdi:magnify" className="knowledge-tab-icon" />
                  搜索测试
                </span>
              }
              key="2"
            >
              <div className="knowledge-search-section">
                <div className="knowledge-search-header">
                  <Title level={5} className="knowledge-section-title">
                    <Iconify icon="mdi:search-web" className="knowledge-section-icon" />
                    智能搜索
                  </Title>
                  <Paragraph className="knowledge-section-desc">
                    测试知识库的搜索功能和相关性
                  </Paragraph>
                </div>

                <div className="knowledge-search-input">
                  <Search
                    placeholder="输入搜索关键词，测试知识库检索效果"
                    allowClear
                    enterButton={
                      <Button type="primary" size="large">
                        <Iconify icon="mdi:magnify" size={16} />
                        搜索
                      </Button>
                    }
                    size="large"
                    onSearch={onSearch}
                    loading={isSearching}
                    className="knowledge-search-bar"
                  />
                </div>

                {searchQuery && (
                  <div className="knowledge-search-results">
                    {isSearching ? (
                      <div className="knowledge-search-loading">
                        <Spin size="large" tip="搜索中..." />
                      </div>
                    ) : searchResults?.data && searchResults.data.length > 0 ? (
                      <div className="knowledge-search-results-list">
                        <div className="knowledge-search-stats">
                          <Tag color="blue" className="knowledge-search-count">
                            找到 {searchResults?.data?.length || 0} 条相关结果
                          </Tag>
                        </div>
                        {searchResults?.data?.map((item: any, index: number) => (
                          <Card
                            key={`search-result-${index}`}
                            className="knowledge-search-result-card"
                            hoverable
                          >
                            <div className="knowledge-search-result-content">
                              <div className="knowledge-search-result-header">
                                <Iconify icon="mdi:file-document-outline" className="knowledge-search-result-icon" />
                                <span className="knowledge-search-result-title">搜索结果 {index + 1}</span>
                              </div>
                              <div className="knowledge-search-result-body">
                                搜索结果内容展示区域
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="knowledge-search-empty">
                        <Empty
                          description="没有找到相关结果"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                          <Paragraph className="knowledge-search-empty-tip">
                            尝试使用不同的关键词或检查知识库是否包含相关内容
                          </Paragraph>
                        </Empty>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>

      {/* 导入模态框 */}
      <Modal
        title={getImportModalTitle()}
        open={importModalVisible}
        onCancel={handleImportCancel}
        onOk={handleImportSubmit}
        width={importType === ImportType.QA ? 900 : 700}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" className="mt-4">
          {renderImportModalContent()}
        </Form>
      </Modal>
    </div>
  );
}
