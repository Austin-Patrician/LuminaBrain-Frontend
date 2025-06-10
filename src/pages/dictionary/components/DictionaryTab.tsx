import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Switch,
  Table,
  Tag,
  message,
  Pagination,
  Select,
  InputNumber,
} from "antd";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import dictionaryService from "@/api/services/dictionaryService";
import { IconButton, Iconify } from "@/components/icon";
import type { Dictionary } from "#/entity";
import type {

  DictionaryItem,
  DictionaryListResponse,
  DictionaryItemListResponse
} from "#/entity";
interface DictionaryTabProps {
  onDictionarySelect: (dictionaryId: string) => void;
}

interface SearchFormFieldType {
  name?: string;
  enabled?: boolean;
}

interface DictionaryModalData {
  visible: boolean;
  mode: 'create' | 'edit';
  data?: Dictionary;
}

export default function DictionaryTab({ onDictionarySelect }: DictionaryTabProps) {
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<SearchFormFieldType>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modal, setModal] = useState<DictionaryModalData>({ visible: false, mode: 'create' });

  // 获取字典列表
  const { data, isLoading, refetch } = useQuery<DictionaryListResponse>({
    queryKey: ["dictionaries", searchParams, pagination],
    queryFn: () =>
      dictionaryService.getDictionaryList({
        ...searchParams,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      }),
  });

  // 创建字典
  const createMutation = useMutation({
    mutationFn: dictionaryService.createDictionary,
    onSuccess: () => {
      message.success("字典创建成功");
      handleModalClose();
      refetch();
    },
    onError: () => {
      message.error("字典创建失败");
    },
  });

  // 更新字典
  const updateMutation = useMutation({
    mutationFn: dictionaryService.updateDictionary,
    onSuccess: () => {
      message.success("字典更新成功");
      handleModalClose();
      refetch();
    },
    onError: () => {
      message.error("字典更新失败");
    },
  });

  // 删除字典
  const deleteMutation = useMutation({
    mutationFn: dictionaryService.deleteDictionary,
    onSuccess: () => {
      message.success("字典删除成功");
      refetch();
    },
    onError: () => {
      message.error("字典删除失败");
    },
  });

  const dictionaries = data?.data || [];
  const totalCount = data?.data?.total || 0;

  const columns: ColumnsType<Dictionary> = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text: string, record: Dictionary) => (
        <Button
          type="link"
          className="p-0 h-auto text-left"
          onClick={() => onDictionarySelect(record.id)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "排序",
      dataIndex: "sort",
      key: "sort",
      width: 80,
      align: "center",
    },
    {
      title: "状态",
      dataIndex: "enabled",
      key: "enabled",
      width: 100,
      align: "center",
      render: (enabled: boolean) => (
        <Tag color={enabled ? "success" : "error"}>
          {enabled ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "creationTime",
      key: "creationTime",
      width: 180,
      render: (date: string) => date ? new Date(date).toLocaleString() : "-",
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record: Dictionary) => (
        <Space size="small">
          <IconButton onClick={() => handleEdit(record)}>
            <Iconify icon="solar:pen-bold-duotone" size={16} />
          </IconButton>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个字典吗？"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <IconButton>
              <Iconify icon="mingcute:delete-2-fill" size={16} className="text-error" />
            </IconButton>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchParams(values);
    setPagination({ current: 1, pageSize: 10 });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({});
    setPagination({ current: 1, pageSize: 10 });
  };

  const handleCreate = () => {
    setModal({ visible: true, mode: 'create' });
    modalForm.resetFields();
    modalForm.setFieldsValue({
      enabled: true,
      sort: 0
    });
  };

  const handleEdit = (record: Dictionary) => {
    setModal({ visible: true, mode: 'edit', data: record });
    modalForm.setFieldsValue({
      ...record,
      enabled: record.enabled ?? true,
      sort: record.sort ?? 0
    });
  };

  // 新增：统一的模态框关闭处理函数
  const handleModalClose = () => {
    setModal({ visible: false, mode: 'create', data: undefined });
    modalForm.resetFields();
  };

  const handleModalOk = () => {
    modalForm.validateFields().then((values) => {
      if (modal.mode === 'create') {
        createMutation.mutate(values);
      } else if (modal.data) {
        updateMutation.mutate({ ...modal.data, ...values });
      }
    });
  };

  const handleModalCancel = () => {
    handleModalClose();
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      {/* 搜索区域 */}
      <Card>
        <Form form={searchForm} layout="inline">
          <Row gutter={[16, 16]} className="w-full">
            <Col span={24} lg={8}>
              <Form.Item<SearchFormFieldType> label="名称" name="name" className="!mb-0">
                <Input placeholder="搜索字典名称" />
              </Form.Item>
            </Col>
            <Col span={24} lg={8}>
              <Form.Item<SearchFormFieldType> label="状态" name="enabled" className="!mb-0">
                <Select placeholder="选择状态" allowClear>
                  <Select.Option value={true}>启用</Select.Option>
                  <Select.Option value={false}>禁用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={8}>
              <div className="flex justify-end">
                <Button onClick={handleReset}>重置</Button>
                <Button type="primary" className="ml-4" onClick={handleSearch}>
                  搜索
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 字典列表 */}
      <Card
        title="字典列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增字典
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dictionaries}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />

        {/* 分页组件 - 当有数据时显示 */}
        {(totalCount > 0 || dictionaries.length > 0) && (
          <div className="flex justify-end mt-4">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={totalCount}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
              pageSizeOptions={['10', '20', '50', '100']}
            />
          </div>
        )}
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={modal.mode === 'create' ? '新增字典' : '编辑字典'}
        open={modal.visible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form
          form={modalForm}
          layout="vertical"
          initialValues={{ enabled: true, sort: 0 }}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入字典名称' }]}
          >
            <Input placeholder="请输入字典名称" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea placeholder="请输入字典描述" rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="排序"
                name="sort"
                rules={[{ required: true, message: '请输入排序值' }]}
              >
                <InputNumber min={0} className="w-full" placeholder="排序值" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="enabled"
                valuePropName="checked"
              >
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
}