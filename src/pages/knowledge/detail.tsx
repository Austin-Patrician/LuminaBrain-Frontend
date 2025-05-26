import { useQuery, useMutation } from "@tanstack/react-query";
// 添加apiClient导入
import apiClient from "@/api/apiClient";
import {
  Button, Card, Tabs, Space, Typography, Tag, Descriptions, Empty,
  Table, Input, Spin, Tooltip, Dropdown, Modal, Radio, Upload, Form, message,
  Divider, Alert, Steps, Row, Col
} from "antd";
import type { MenuProps, UploadProps } from 'antd';
import { useParams } from "@/router/hooks";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';

import knowledgeService from "@/api/services/knowledgeService";
import { IconButton, Iconify } from "@/components/icon";

// 导入样式文件
import './index.css';

const { Title, Paragraph, Text, Link } = Typography;
const { Search, TextArea } = Input;
const { TabPane } = Tabs;
const { Dragger } = Upload;

// 导入类型枚举
enum ImportType {
  FILE = '3f8b38d6-f321-4d1a-89c0-93d7a5023a2c',
  LINK = '47c5ab88-65e4-4ea8-a214-b384b9d37d27',
  TEXT = 'd6a6eeb2-79d9-4a5f-8f1b-f2c9a7c4d2b0',
  QA = 'c18b1f8a-4e70-49e5-b7cc-59af73c3bc6a'
}

// 切分类型枚举
enum SplitType {
  DIRECT = 'direct',
  QA = 'qa'
}

// 添加文本省略显示的公共渲染函数
const EllipsisText = ({ text }: { text: string }) => (
  <Tooltip title={text} placement="topLeft">
    <div className="truncate">{text}</div>
  </Tooltip>
);

// 更新模板下载组件，使其更美观
const TemplateDownloadSection = () => (
  <div className="template-download-section">
    <Divider orientation="left">QA模板下载</Divider>
    <Alert
      message="使用QA切分需要按照特定格式准备数据"
      description="下载模板文件，按照模板格式填写您的问答数据。CSV和Excel模板中包含'问题'和'答案'列，JSON模板包含question和answer字段。"
      type="info"
      showIcon
      className="mb-3"
    />
    <div className="flex flex-wrap gap-2">
      <Button
        icon={<DownloadOutlined />}
        href="/templates/qa-template.csv"
        download="qa-template.csv"
        type="default"
      >
        CSV模板
      </Button>
      <Button
        icon={<DownloadOutlined />}
        href="/templates/qa-template.xlsx"
        download="qa-template.xlsx"
        type="default"
      >
        Excel模板
      </Button>
      <Button
        icon={<DownloadOutlined />}
        href="/templates/qa-template.json"
        download="qa-template.json"
        type="default"
      >
        JSON模板
      </Button>
    </div>
  </div>
);

// 添加QA导入指引组件
const QAImportGuide = () => (
  <Steps
    direction="vertical"
    size="small"
    current={-1}
    className="qa-import-guide mb-4"
    items={[
      {
        title: "下载模板",
        description: "选择您熟悉的格式，下载对应的QA数据模板",
        status: "process",
        icon: <Iconify icon="mdi:download-outline" />
      },
      {
        title: "填写数据",
        description: "按照模板格式填写您的问题和答案对",
        status: "process",
        icon: <Iconify icon="mdi:file-edit-outline" />
      },
      {
        title: "上传文件",
        description: "将填写好的文件拖拽到上传区域或点击上传",
        status: "process",
        icon: <Iconify icon="mdi:cloud-upload-outline" />
      }
    ]}
  />
);

// 验证URL的正则表达式
const URL_REGEX = /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

export default function KnowledgeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importType, setImportType] = useState<ImportType>(ImportType.FILE);
  const [splitType, setSplitType] = useState<SplitType>(SplitType.DIRECT); // 默认直接导入
  const [form] = Form.useForm();

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
    setSearchQuery(value);
  };

  const onBackClick = () => {
    navigate(-1);
  };

  // 重置导入表单和状态
  const resetImportState = () => {
    setSplitType(SplitType.DIRECT); // 重置为直接导入
    form.resetFields();
  };

  // 处理导入菜单点击
  const handleImportMenuClick: MenuProps['onClick'] = (e) => {
    setImportType(e.key as ImportType);
    resetImportState(); // 重置状态
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
      data
    }: {
      file?: File,
      knowledgeId: string,
      splitType: SplitType,
      importType: ImportType,
      data?: string
    }) => {
      try {
        // 1. 获取CSRF令牌
        const tokenResponse = await knowledgeService.getAntiforgerytoken();
        const csrfToken = tokenResponse;

        console.log('CSRF Token:', csrfToken);

        // 2. 准备FormData - 确保字段名称与后端期望的完全匹配
        const formData = new FormData();

        // 根据不同导入类型添加不同的数据
        if (importType === ImportType.FILE || importType === ImportType.QA) {
          // 文件上传类型
          if (!file) throw new Error('File is required for file upload');
          formData.append('formFile', file);
          console.log('准备上传文件:', file.name, file.type, file.size);
        } else if (data) {
          // 链接或文本导入类型，将数据添加到data字段
          formData.append('data', data);
          console.log('准备导入数据类型:', importType, '数据长度:', data.length);
        }

        // 添加共通字段
        formData.append('splitType', splitType);  // 切分方式
        formData.append('importType', importType); // 导入类型

        // 3. 设置headers
        const headers = {
          'Content-Type': 'multipart/form-data',

        };

        // 4. 调用上传API，knowledgeId作为路由参数传递
        return await knowledgeService.uploadFile(knowledgeId, formData, headers);
      } catch (error) {
        console.error('Upload file error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      message.success('导入成功');
    },
    onError: (error) => {
      message.error(`导入失败: ${error}`);
    }
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
        splitType,
        importType: ImportType.FILE, // 这里是文件上传，固定为FILE类型
        data: undefined
      });

      console.log('上传成功，服务器响应:', result);

      // 完成进度
      onProgress({ percent: 100 });
      onSuccess();
    } catch (error: any) {
      console.error('上传失败:', error);
      // 提供更详细的错误信息
      const errorMessage = error.response ?
        `错误 ${error.response.status}: ${error.response.statusText}` :
        error.message || '未知错误';
      onError(new Error(errorMessage));
    }
  };

  // 更新文件上传配置 - 修改为单文件上传
  const uploadProps: UploadProps = {
    name: 'formFile',
    multiple: false, // 修改为false，只支持单文件
    maxCount: 1, // 限制最多只能上传1个文件
    customRequest: customUploadRequest,
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功。`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败。`);
      }
    },
    onDrop(e) {
      // 如果用户尝试拖拽多个文件，只处理第一个
      if (e.dataTransfer.files.length > 1) {
        message.warning('每次只能上传一个文件');
      }
      console.log('Dropped file:', e.dataTransfer.files[0]);
    },
    accept: importType === ImportType.FILE ?
      '.pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.ppt,.pptx' :
      (importType === ImportType.QA ? '.csv,.xlsx,.json' : undefined),
    // 不再设置action属性，因为我们使用customRequest
  };

  // 添加文件上传文本提示
  const renderUploadHint = () => {
    if (importType === ImportType.FILE) {
      return "支持上传单个文件。支持 PDF, Word, TXT, CSV, Excel, PPT 等格式。";
    } else if (importType === ImportType.QA) {
      return "支持上传单个QA文件，支持CSV、Excel或JSON格式，请确保文件结构符合模板要求。";
    }
    return "";
  };

  // 提交导入 - 修改以处理链接和文本导入
  const handleImportSubmit = () => {
    form.validateFields().then(values => {
      // 不同的导入类型有不同的处理逻辑
      if (importType === ImportType.LINK) {
        // 处理链接导入
        const links = values.links.split('\n')
          .map((url: string) => url.trim())
          .filter((url: string) => url);

        if (links.length > 0) {
          uploadFileMutation.mutate({
            knowledgeId: id as string,
            splitType,
            importType: ImportType.LINK,
            data: JSON.stringify(links) // 将链接数组转为JSON字符串
          });
        } else {
          message.error('请输入至少一个有效的链接');
          return;
        }
      }
      else if (importType === ImportType.TEXT) {
        // 处理文本导入
        if (values.content) {
          uploadFileMutation.mutate({
            knowledgeId: id as string,
            splitType,
            importType: ImportType.TEXT,
            data: values.content
          });
        } else {
          message.error('请输入文本内容');
          return;
        }
      }
      // 文件上传通过Upload组件的customRequest处理

      setImportModalVisible(false);
      resetImportState();
    });
  };

  // 导入菜单项
  const importItems: MenuProps['items'] = [
    {
      key: ImportType.FILE,
      label: '文件导入',
      icon: <Iconify icon="ic:round-file-upload" />,
    },
    {
      key: ImportType.LINK,
      label: '链接导入',
      icon: <Iconify icon="mdi:link-variant" />,
    },
    {
      key: ImportType.TEXT,
      label: '文本导入',
      icon: <Iconify icon="material-symbols:text-snippet" />,
    },
    {
      key: ImportType.QA,
      label: 'QA导入',
      icon: <Iconify icon="mdi:comment-question" />,
    },
  ];

  // 知识项表格列定义 - 根据实际数据结构调整
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      ellipsis: true,
      render: (text: string) => <EllipsisText text={text} />,
    },
    {
      title: '数据',
      dataIndex: 'data',
      key: 'data',
      width: 250,
      ellipsis: true,
      render: (text: string) => <EllipsisText text={text} />,
    },
    {
      title: '文件ID',
      dataIndex: 'fileId',
      key: 'fileId',
      width: 120,
      ellipsis: true,
      render: (text: string) => <EllipsisText text={text} />,
    },
    {
      title: '数据量',
      dataIndex: 'dataCount',
      key: 'dataCount',
      width: 100,
    },
    {
      title: '导入类型',
      dataIndex: 'importType',
      key: 'importType',
      width: 120,
      ellipsis: true,
      render: (text: string) => <EllipsisText text={text} />,
    },
    {
      title: '状态',
      dataIndex: 'knowledgeItemStatus',
      key: 'knowledgeItemStatus',
      width: 100,
      render: (status: string) => (
        <Tag color={status === '可用' ? 'success' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'creationTime',
      key: 'creationTime',
      width: 160,
      render: (time: string) => {
        const formattedTime = new Date(time).toLocaleString();
        return <EllipsisText text={formattedTime} />;
      },
    },
    {
      title: 'QA类型',
      dataIndex: 'isQA',
      key: 'isQA',
      width: 100,
      render: (isQA: boolean) => (
        isQA ? <Tag color="blue">是</Tag> : <Tag>否</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record: any) => (
        <Space size="small">
          <IconButton title="查看">
            <Iconify icon="solar:eye-bold-duotone" size={18} />
          </IconButton>
          <IconButton title="删除">
            <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
          </IconButton>
        </Space>
      ),
    },
  ];

  // 渲染导入模态框内容
  const renderImportModalContent = () => {
    switch (importType) {
      case ImportType.FILE:
        return (
          <div className="import-form-container">
            <Form.Item name="splitTypeOption" label="切分方式" initialValue={SplitType.DIRECT}>
              <Radio.Group
                className="import-split-selector"
                value={splitType}
                onChange={e => setSplitType(e.target.value)}
              >
                <Radio.Button value={SplitType.DIRECT}>直接切分</Radio.Button>
                <Radio.Button value={SplitType.QA}>QA切分</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Alert
              message="单文件上传说明"
              description="每次只能上传一个文件，如需批量导入，请分别上传。"
              type="info"
              showIcon
              className="mb-6 import-tip-alert" // 将mb-4改为mb-6，增加底部边距
              style={{
                backgroundColor: '#f9fafb',
                borderColor: '#e5e7eb',
                fontSize: '0.9rem',
                opacity: 0.85
              }}
            />

            <Form.Item name="files" className="mt-4"> {/* 添加上边距 */}
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                  {renderUploadHint()}
                </p>
              </Dragger>
            </Form.Item>
          </div>
        );

      case ImportType.LINK:
        return (
          <div className="import-form-container">
            <Form.Item name="splitTypeOption" label="切分方式" initialValue={SplitType.DIRECT}>
              <Radio.Group
                className="import-split-selector"
                value={splitType}
                onChange={e => setSplitType(e.target.value)}
              >
                <Radio.Button value={SplitType.DIRECT}>直接切分</Radio.Button>
                <Radio.Button value={SplitType.QA}>QA切分</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Alert
              message="链接导入说明"
              description="只支持导入静态网页内容，不支持需要登录或动态生成内容的页面。"
              type="info"
              showIcon
              className="mb-6 import-tip-alert" // 增加边距
              style={{
                backgroundColor: '#f9fafb',
                borderColor: '#e5e7eb',
                fontSize: '0.9rem',
                opacity: 0.85
              }}
            />

            <Form.Item
              name="links"
              label="链接地址"
              className="mt-4" // 增加上边距
              rules={[
                { required: true, message: '请输入至少一个链接地址' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const urls = value.split('\n').filter(url => url.trim());
                    const invalidUrls = urls.filter(url => !URL_REGEX.test(url.trim()));

                    if (invalidUrls.length > 0) {
                      return Promise.reject(
                        `���在无效的URL格式: ${invalidUrls.slice(0, 2).join(', ')}${invalidUrls.length > 2 ? '等' : ''}`
                      );
                    }
                    return Promise.resolve();
                  }
                }
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
              <Title level={5} className="mb-2">支持的链接类型</Title>
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
            <Form.Item name="splitTypeOption" label="切分方式" initialValue={SplitType.DIRECT}>
              <Radio.Group
                className="import-split-selector"
                value={splitType}
                onChange={e => setSplitType(e.target.value)}
              >
                <Radio.Button value={SplitType.DIRECT}>直接切分</Radio.Button>
                <Radio.Button value={SplitType.QA}>QA切分</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="content"
              label="文本内容"
              rules={[{ required: true, message: '请输入文本内容' }]}
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
          <div className="import-form-container">
            <Row gutter={[24, 16]}>
              <Col xs={24} md={10}>
                <div className="qa-import-info-panel">
                  <Title level={5}>QA导入说明</Title>
                  <Paragraph>
                    QA导入允许您批量上传问答对，系统将根据您提供的数据构建知识库。
                  </Paragraph>
                  <QAImportGuide />
                  <Divider dashed />
                  <div className="mt-4">
                    <Title level={5}>支持的格式</Title>
                    <ul className="mt-2 ml-4 list-disc">
                      <li>CSV文件 (.csv)</li>
                      <li>Excel表格 (.xlsx)</li>
                      <li>JSON文件 (.json)</li>
                    </ul>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={14}>
                <Card className="qa-import-content-panel" bordered={false}>
                  <TemplateDownloadSection />
                  <Divider />
                  <Title level={5}>上传QA文件</Title>
                  <Form.Item
                    name="qaFiles"
                    className="mt-6" // 增加上边距
                    rules={[{ required: true, message: '请上传QA文件' }]}
                  >
                    <Dragger
                      {...uploadProps}
                      className="qa-file-uploader"
                      listType="picture"
                    >
                      <p className="ant-upload-drag-icon">
                        <Iconify icon="mdi:cloud-upload-outline" width={48} height={48} />
                      </p>
                      <p className="ant-upload-text">点击或拖拽QA文件到此区域</p>
                      <p className="ant-upload-hint">
                        {renderUploadHint()}
                      </p>
                    </Dragger>
                  </Form.Item>
                </Card>
              </Col>
            </Row>
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
        splitTypeOption: SplitType.DIRECT
      });
    }
  }, [importModalVisible, form, importType]);

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
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <div className="flex items-center mb-4">
          <Button icon={<Iconify icon="material-symbols:arrow-back" />} onClick={onBackClick} />
          <Title level={4} className="ml-4 mb-0">知识库详情</Title>
        </div>

        {isLoadingKnowledge ? (
          <div className="flex justify-center items-center p-8">
            <Spin tip="加载中..." />
          </div>
        ) : !knowledge ? (
          <Empty description="未找到知识库数据" />
        ) : (
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="名称">{knowledge.name}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={knowledge.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "success" : "error"}>
                {knowledge.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="OCR支持">
              {knowledge.isOCR ? <Tag color="cyan">已启用</Tag> : <Tag>未启用</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="聊天模型">{knowledge.chatModel || '-'}</Descriptions.Item>
            <Descriptions.Item label="嵌入模型">{knowledge.embeddingModel || '-'}</Descriptions.Item>
            <Descriptions.Item label="文件数">{knowledge.fileCount || 0}</Descriptions.Item>
            <Descriptions.Item label="段落令牌">{knowledge.maxTokensPerParagraph || '-'}</Descriptions.Item>
            <Descriptions.Item label="行令牌">{knowledge.maxTokensPerLine || '-'}</Descriptions.Item>
            <Descriptions.Item label="重叠令牌">{knowledge.overlappingTokens || '-'}</Descriptions.Item>
            <Descriptions.Item label="描述" span={3}>
              {knowledge.description || "无描述"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="知识项列表" key="1">
            <div className="flex justify-end mb-4">
              <Dropdown menu={{ items: importItems, onClick: handleImportMenuClick }}>
                <Button type="primary">
                  <Space>
                    导入
                    <Iconify icon="mdi:chevron-down" />
                  </Space>
                </Button>
              </Dropdown>
            </div>
            <Table
              columns={columns}
              dataSource={knowledgeItems}
              loading={isLoadingKnowledge}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1300 }}
              bordered
              size="middle"
              className="overflow-hidden"
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="搜索测试" key="2">
            <div className="mb-4">
              <Search
                placeholder="输入搜索关键词"
                allowClear
                enterButton="搜索"
                size="large"
                onSearch={onSearch}
                loading={isSearching}
              />
            </div>
            {searchQuery && !isSearching && (
              <div>
                {searchResults?.data?.length ? (
                  <div>
                    {/* 搜索结果展示区域 */}
                    <div className="mb-2 text-gray-500">找到 {searchResults.data.length} 条结果</div>
                    {searchResults.data.map((item, index) => (
                      <Card key={index} className="mb-4">
                        {/* 搜索结果内容 */}
                        <div>搜索结果展示</div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Empty description="没有找到相关结果" />
                )}
              </div>
            )}
          </Tabs.TabPane>
        </Tabs>
      </Card>

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
    </Space>
  );
}
