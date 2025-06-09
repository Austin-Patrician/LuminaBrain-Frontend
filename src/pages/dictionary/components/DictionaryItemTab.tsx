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
  TreeSelect,
  Alert,
} from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import dictionaryService from "@/api/services/dictionaryService";
import { IconButton, Iconify } from "@/components/icon";
import type { Dictionary, DictionaryItem } from "#/entity";

interface DictionaryItemTabProps {
  selectedDictionaryId?: string;
}

interface SearchFormFieldType {
  dictionaryId?: string;
  value?: string;
  label?: string;
  enabled?: boolean;
  parentId?: string;
}

interface DictionaryItemModalData {
  visible: boolean;
  mode: 'create' | 'edit';
  data?: DictionaryItem;
}

export default function DictionaryItemTab({ selectedDictionaryId }: DictionaryItemTabProps) {
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<SearchFormFieldType>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modal, setModal] = useState<DictionaryItemModalData>({ visible: false, mode: 'create' });

  // 获取字典下拉选项
  const { data: dictionaryOptions } = useQuery({
    queryKey: ["dictionaryDropdown"],
    queryFn: dictionaryService.getDictionaryDropdown,
  });

  // 获取字典项列表
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dictionaryItems", searchParams, pagination],
    queryFn: () =>
      dictionaryService.getDictionaryItemList({
        ...searchParams,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      }),
    enabled: !!searchParams.dictionaryId,
  });

  // 获取当前字典的树形数据（用于父级选择）
  const { data: treeData } = useQuery({
    queryKey: ["dictionaryItemTree", searchParams.dictionaryId],
    queryFn: () => dictionaryService.getDictionaryItemTree(searchParams.dictionaryId!),
    enabled: !!searchParams.dictionaryId,
  });

  // 创建字典项
  const createMutation = useMutation({
    mutationFn: dictionaryService.createDictionaryItem,
    onSuccess: () => {
      message.success("字典项创建成功");
      setModal({ visible: false, mode: 'create' });
      modalForm.resetFields();
      refetch();
    },
    onError: () => {
      message.error("字典项创建失败");
    },
  });

  // 更新字典项
  const updateMutation = useMutation({
    mutationFn: dictionaryService.updateDictionaryItem,
    onSuccess: () => {
      message.success("字典项更新成功");
      setModal({ visible: false, mode: 'create' });
      modalForm.resetFields();
      refetch();
    },
    onError: () => {
      message.error("字典项更新失败");
    },
  });

  // 删除字典项
  const deleteMutation = useMutation({
    mutationFn: dictionaryService.deleteDictionaryItem,
    onSuccess: () => {
      message.success("字典项删除成功");
      refetch();
    },
    onError: () => {
      message.error("字典项删除失败");
    },
  });

  const dictionaryItems = data?.data?.data || [];
  const totalCount = data?.data?.total || 0;
  const dictionaries = dictionaryOptions?.data || [];

  // 当选中的字典ID变化时，更新搜索参数
  useEffect(() => {
    if (selectedDictionaryId) {
      setSearchParams(prev => ({ ...prev, dictionaryId: selectedDictionaryId }));
      searchForm.setFieldsValue({ dictionaryId: selectedDictionaryId });
    }
  }, [selectedDictionaryId, searchForm]);

  // 转换树形数据格式
  const buildTreeSelectData = (items: DictionaryItem[]): any[] => {
    return items.map(item => ({
      title: item.label,
      value: item.id,
      key: item.id,
      children: item.children ? buildTreeSelectData(item.children) : undefined,
    }));
  };

  const treeSelectData = treeData?.data ? buildTreeSelectData(treeData.data) : [];

  const columns: ColumnsType<DictionaryItem> = [
    {
      title: "值",
      dataIndex: "value",
      key: "value",
      width: 150,
    },
    {
      title: "标签",
      dataIndex: "label",
      key: "label",
      width: 150,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "父级",
      dataIndex: "parentId",
      key: "parentId",
      width: 120,
      render: (parentId: string) => {
        const parent = dictionaryItems.find(item => item.id === parentId);
        return parent ? parent.label : "-";
      },
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
      render: (_, record: DictionaryItem) => (
        <Space size="small">
          <IconButton onClick={() => handleEdit(record)}>
            <Iconify icon="solar:pen-bold-duotone" size={16} />
          </IconButton>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个字典项吗？"
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
    const resetParams = selectedDictionaryId ? { dictionaryId: selectedDictionaryId } : {};
    setSearchParams(resetParams);
    setPagination({ current: 1, pageSize: 10 });
  };

  const handleCreate = () => {
    if (!searchParams.dictionaryId) {
      message.warning("请先选择字典");
      return;
    }
    setModal({ visible: true, mode: 'create' });
    modalForm.resetFields();
    modalForm.setFieldsValue({ dictionaryId: searchParams.dictionaryId });
  };

  const handleEdit = (record: DictionaryItem) => {
    setModal({ visible: true, mode: 'edit', data: record });
    modalForm.setFieldsValue(record);
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
    setModal({ visible: false, mode: 'create' });
    modalForm.resetFields();
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
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType> label="字典" name="dictionaryId" className="!mb-0">
                <Select placeholder="选择字典" allowClear>
                  {dictionaries.map((dict: any) => (
                    <Select.Option key={dict.value} value={dict.value}>
                      {dict.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType> label="值" name="value" className="!mb-0">
                <Input placeholder="搜索字典项值" />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType> label="标签" name="label" className="!mb-0">
                <Input placeholder="搜索字典项标签" />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType> label="状态" name="enabled" className="!mb-0">
                <Select placeholder="选择状态" allowClear>
                  <Select.Option value={true}>启用</Select.Option>
                  <Select.Option value={false}>禁用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
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

      {/* 字典项列表 */}
      <Card
        title="字典项列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增字典项
          </Button>
        }
      >
        {!searchParams.dictionaryId && (
          <Alert
            message="请先选择字典"
            description="选择字典后才能查看和管理字典项"
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        <Table
          columns={columns}
          dataSource={dictionaryItems}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />

        {totalCount > 0 && (
          <div className="flex justify-end mt-4">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={totalCount}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
            />
          </div>
        )}
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={modal.mode === 'create' ? '新增字典项' : '编辑字典项'}
        open={modal.visible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={700}
      >
        <Form
          form={modalForm}
          layout="vertical"
          initialValues={{ enabled: true, sort: 0 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="字典"
                name="dictionaryId"
                rules={[{ required: true, message: '请选择字典' }]}
              >
                <Select placeholder="选择字典" disabled={modal.mode === 'edit'}>
                  {dictionaries.map((dict: any) => (
                    <Select.Option key={dict.value} value={dict.value}>
                      {dict.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="父级"
                name="parentId"
              >
                <TreeSelect
                  placeholder="选择父级字典项"
                  allowClear
                  treeData={treeSelectData}
                  treeDefaultExpandAll
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="值"
                name="value"
                rules={[{ required: true, message: '请输入字典项值' }]}
              >
                <Input placeholder="请输入字典项值" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="标签"
                name="label"
                rules={[{ required: true, message: '请输入字典项标签' }]}
              >
                <Input placeholder="请输入字典项标签" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea placeholder="请输入字典项描述" rows={3} />
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
