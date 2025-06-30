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
import { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { DictionaryItemListResponse } from "#/entity";
import dictionaryService from "@/api/services/dictionaryService";
import { IconButton, Iconify } from "@/components/icon";
import type { DictionaryItem } from "#/entity";

interface DictionaryItemTabProps {
  selectedDictionaryIds?: string[]; // 修改为数组类型
}

interface SearchFormFieldType {
  dictionaryIds?: string[]; // 重命名为 dictionaryIds
  value?: string;
  label?: string;
  enabled?: boolean;
  parentId?: string;
}

interface DictionaryItemModalData {
  visible: boolean;
  mode: "create" | "edit";
  data?: DictionaryItem;
}

export default function DictionaryItemTab({
  selectedDictionaryIds,
}: DictionaryItemTabProps) {
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<SearchFormFieldType>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modal, setModal] = useState<DictionaryItemModalData>({
    visible: false,
    mode: "create",
  });

  // 获取字典下拉选项
  const { data: dictionaryOptions } = useQuery({
    queryKey: ["dictionaryDropdown"],
    queryFn: dictionaryService.getDictionaryDropdown,
  });

  // 获取字典项列表 - 移除enabled条件，默认显示所有字典项
  const { data, isLoading, refetch } = useQuery<DictionaryItemListResponse>({
    queryKey: ["dictionaryItems", searchParams, pagination],
    queryFn: () =>
      dictionaryService.getDictionaryItemList({
        ...searchParams,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      }),
  });

  // 获取当前字典下的所有字典项（用于父级选择）
  // 监听模态框中的字典选择变化
  const [selectedDictionaryForParent, setSelectedDictionaryForParent] =
    useState<string>();

  const { data: parentOptions } = useQuery({
    queryKey: ["dictionaryItemsByDictionary", selectedDictionaryForParent],
    queryFn: () =>
      dictionaryService.getDictionaryItemsByDictionaryId(
        selectedDictionaryForParent!
      ),
    enabled: !!selectedDictionaryForParent,
  });

  // 创建字典项
  const createMutation = useMutation({
    mutationFn: dictionaryService.createDictionaryItem,
    onSuccess: () => {
      message.success("字典项创建成功");
      handleModalClose();
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
      handleModalClose();
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

  const dictionaryItems = data?.data || [];
  const totalCount = data?.data?.total || 0;
  const dictionaries = dictionaryOptions || [];

  // 当选中的字典ID变化时，更新搜索参数
  useEffect(() => {
    if (selectedDictionaryIds && selectedDictionaryIds.length > 0) {
      setSearchParams((prev) => ({
        ...prev,
        dictionaryIds: selectedDictionaryIds,
      })); // 重命名为 dictionaryIds
      searchForm.setFieldsValue({ dictionaryIds: selectedDictionaryIds }); // 重命名为 dictionaryIds
    }
  }, [selectedDictionaryIds, searchForm]);

  // 转换父级选择数据格式，排除当前编辑的字典项
  const getParentSelectData = () => {
    if (!parentOptions) return [];

    // 根据API返回的数据结构访问实际的字典项数组
    const allItems = Array.isArray(parentOptions) ? parentOptions : [];
    const excludeId =
      modal.mode === "edit" && modal.data ? modal.data.id : undefined;

    return allItems
      .filter((item: DictionaryItem) => item.id !== excludeId) // 排除当前编辑的字典项
      .map((item: DictionaryItem) => ({
        value: item.id,
        label: item.label,
      }));
  };

  const parentSelectData = getParentSelectData();

  const columns: ColumnsType<DictionaryItem> = [
    {
      title: "字典名称",
      dataIndex: "dictionaryName",
      key: "dictionaryName",
      width: 150,
      render: (dictionaryName: string, record: DictionaryItem) => {
        // 如果没有字典名称，从下拉选项中查找
        if (!dictionaryName && record.dictionaryId) {
          const dict = dictionaries.find(
            (d: any) => d.value === record.dictionaryId
          );
          return dict ? dict.label : "-";
        }
        return dictionaryName || "-";
      },
    },
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
        const parent = dictionaryItems.find(
          (item: DictionaryItem) => item.id === parentId
        );
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
      render: (date: string) => (date ? new Date(date).toLocaleString() : "-"),
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
              <Iconify
                icon="mingcute:delete-2-fill"
                size={16}
                className="text-error"
              />
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
    const resetParams =
      selectedDictionaryIds && selectedDictionaryIds.length > 0
        ? { dictionaryIds: selectedDictionaryIds }
        : {}; // 重命名为 dictionaryIds
    setSearchParams(resetParams);
    setPagination({ current: 1, pageSize: 10 });
  };

  const handleCreate = () => {
    setModal({ visible: true, mode: "create" });
    modalForm.resetFields();
    modalForm.setFieldsValue({
      enabled: true,
      sort: 0,
    });
    // 如果当前有选中的字典，自动填充
    if (searchParams.dictionaryIds && searchParams.dictionaryIds.length > 0) {
      // 重命名为 dictionaryIds
      modalForm.setFieldsValue({
        dictionaryId: searchParams.dictionaryIds[0], // 注意：这里仍然是 dictionaryId，因为创建时只能选择一个字典
        enabled: true,
        sort: 0,
      });
      setSelectedDictionaryForParent(searchParams.dictionaryIds[0]);
    }
  };

  const handleEdit = (record: DictionaryItem) => {
    setModal({ visible: true, mode: "edit", data: record });
    modalForm.setFieldsValue({
      ...record,
      enabled: record.enabled ?? true,
      sort: record.sort ?? 0,
    });
    // 设置字典ID用于加载父级选项
    setSelectedDictionaryForParent(record.dictionaryId);
  };

  // 新增：统一的模态框关闭处理函数
  const handleModalClose = () => {
    setModal({ visible: false, mode: "create", data: undefined });
    modalForm.resetFields();
    setSelectedDictionaryForParent(undefined);
  };

  const handleModalOk = () => {
    modalForm.validateFields().then((values) => {
      if (modal.mode === "create") {
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
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType>
                label="字典"
                name="dictionaryIds"
                className="!mb-0"
              >
                <Select
                  placeholder="选择字典"
                  allowClear
                  mode="multiple" // 添加多选模式
                  maxTagCount="responsive" // 响应式标签显示
                >
                  {dictionaries.map((dict: any) => (
                    <Select.Option key={dict.value} value={dict.value}>
                      {dict.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType>
                label="值"
                name="value"
                className="!mb-0"
              >
                <Input placeholder="搜索字典项值" />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType>
                label="标签"
                name="label"
                className="!mb-0"
              >
                <Input placeholder="搜索字典项标签" />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType>
                label="状态"
                name="enabled"
                className="!mb-0"
              >
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
        <Table
          columns={columns}
          dataSource={dictionaryItems}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: "max-content" }}
        />

        {/* 分页组件 - 当有数据时显示 */}
        {(totalCount > 0 || dictionaryItems.length > 0) && (
          <div className="flex justify-end mt-4">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={totalCount}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }
              pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>
        )}
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={modal.mode === "create" ? "新增字典项" : "编辑字典项"}
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
                rules={[{ required: true, message: "请选择字典" }]}
              >
                <Select
                  placeholder="选择字典"
                  disabled={modal.mode === "edit"}
                  onChange={(value) => {
                    setSelectedDictionaryForParent(value);
                    // 清空父级选择
                    modalForm.setFieldValue("parentId", undefined);
                  }}
                >
                  {dictionaries.map((dict: any) => (
                    <Select.Option key={dict.value} value={dict.value}>
                      {dict.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="父级" name="parentId">
                <Select placeholder="选择父级字典项" allowClear>
                  {parentSelectData.map((item: any) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="值"
                name="value"
                rules={[{ required: true, message: "请输入字典项值" }]}
              >
                <Input placeholder="请输入字典项值" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="标签"
                name="label"
                rules={[{ required: true, message: "请输入字典项标签" }]}
              >
                <Input placeholder="请输入字典项标签" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="描述" name="description">
            <Input.TextArea placeholder="请输入字典项描述" rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="排序"
                name="sort"
                rules={[{ required: true, message: "请输入排序值" }]}
              >
                <InputNumber min={0} className="w-full" placeholder="排序值" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="状态" name="enabled" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
}
