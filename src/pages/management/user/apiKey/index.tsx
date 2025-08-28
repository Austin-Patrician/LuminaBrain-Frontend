import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Dropdown,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType, MenuProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import apiKeyService from "@/api/services/apiKeyService";
import { IconButton, Iconify } from "@/components/icon";
import type { ApiKey } from "#/dto/apiKey";

import CreateApiKeyModal from "./components/CreateApiKeyModal";
import EditApiKeyModal from "./components/EditApiKeyModal";
import ApiKeySuccessModal from "./components/ApiKeySuccessModal";

const { Title } = Typography;
const { confirm } = Modal;

export default function ApiKeyPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<ApiKey | null>(null);
  const [createdApiKey, setCreatedApiKey] = useState<ApiKey | null>(null);

  // 获取API Key列表
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: () => apiKeyService.getApiKeyList(),
  });

  const apiKeys: ApiKey[] = data || [];

  // 删除API Key
  const deleteApiKey = useMutation({
    mutationFn: apiKeyService.deleteApiKey,
    onSuccess: () => {
      message.success("API Key deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
    onError: (error) => {
      message.error(`Failed to delete API Key: ${error}`);
    },
  });

  // 处理编辑
  const handleEdit = (apiKey: ApiKey) => {
    setCurrentApiKey(apiKey);
    setEditModalVisible(true);
  };

  // 处理删除 - 双重确认
  const handleDelete = (apiKey: ApiKey) => {
    confirm({
      title: "Delete API Key",
      content: (
        <div>
          <p>Are you sure you want to delete this API Key?</p>
          <p>
            <strong>Name:</strong> {apiKey.apiKeyName}
          </p>
          <p className="text-red-500">
            <strong>Warning:</strong> This action cannot be undone!
          </p>
        </div>
      ),
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        confirm({
          title: "Final Confirmation",
          content: (
            <div>
              <p className="text-red-600 font-semibold">
                This is your final confirmation!
              </p>
              <p>The API Key "{apiKey.apiKeyName}" will be permanently deleted.</p>
            </div>
          ),
          okText: "Yes, Delete It",
          okType: "danger",
          cancelText: "Cancel",
          onOk: () => {
            deleteApiKey.mutate(apiKey.apiKeyId);
          },
        });
      },
    });
  };

  // 处理创建成功
  const handleCreateSuccess = (apiKeyData: ApiKey) => {
    setCreateModalVisible(false);
    setCreatedApiKey(apiKeyData);
    setSuccessModalVisible(true);
    // 不立即刷新列表，等成功弹窗关闭后再刷新
  };

  // 处理成功弹窗关闭
  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
    setCreatedApiKey(null);
    // 刷新API Key列表
    queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
  };

  // 处理编辑成功
  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setCurrentApiKey(null);
    queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
  };



  // 操作菜单
  const getActionMenu = (record: ApiKey): MenuProps => ({
    items: [
      {
        key: "edit",
        label: (
          <div className="flex items-center">
            <Iconify icon="solar:pen-bold-duotone" className="mr-2" size={16} />
            Edit Key
          </div>
        ),
        onClick: () => handleEdit(record),
      },
      {
        key: "delete",
        label: (
          <div className="flex items-center text-red-500">
            <Iconify icon="mingcute:delete-2-fill" className="mr-2" size={16} />
            Delete Key
          </div>
        ),
        onClick: () => handleDelete(record),
      },
    ],
  });

  // 表格列定义
  const columns: ColumnsType<ApiKey> = [
    {
      title: "Name",
      dataIndex: "apiKeyName",
      key: "apiKeyName",
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: "API Key",
      dataIndex: "apiKeyValue",
      key: "apiKeyValue",
      render: (text: string) => (
        <div className="flex items-center">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {text}
          </code>
          <Button
            type="text"
            size="small"
            className="ml-2"
            onClick={() => {
              navigator.clipboard.writeText(text);
              message.success("API Key copied to clipboard");
            }}
          >
            <Iconify icon="solar:copy-bold-duotone" size={16} />
          </Button>
        </div>
      ),
    },
    {
      title: "Expires At",
      dataIndex: "expirationTimeStamp",
      key: "expirationTimeStamp",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "Never",
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={["click"]}>
          <IconButton>
            <MoreOutlined />
          </IconButton>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Space direction="vertical" size="large" className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="!mb-2">
              API Keys
            </Title>
            <p className="text-gray-600 m-0">
              Manage your API keys to access all models from OpenRouter
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            size="large"
          >
            Create API Key
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={apiKeys}
            rowKey="apiKeyId"
            loading={isLoading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </Card>
      </Space>

      {/* 创建API Key模态框 */}
      <CreateApiKeyModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 编辑API Key模态框 */}
      <EditApiKeyModal
        visible={editModalVisible}
        apiKey={currentApiKey}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentApiKey(null);
        }}
        onSuccess={handleEditSuccess}
      />

      {/* API Key创建成功弹窗 */}
      <ApiKeySuccessModal
        visible={successModalVisible}
        apiKeyData={createdApiKey}
        onClose={handleSuccessModalClose}
      />
    </div>
  );
}