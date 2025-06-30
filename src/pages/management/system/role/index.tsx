import { Button, Card, Popconfirm, message, Tag } from "antd";
import Table, { type ColumnsType } from "antd/es/table";
import { useState, useEffect } from "react";

import { IconButton, Iconify } from "@/components/icon";
import roleService, { type RoleSearchParams } from "@/api/services/roleService";

import type { Role } from "#/entity";

import RoleModal, { type RoleModalProps } from "./role-modal";
import PermissionModal, { type PermissionModalProps } from "./permission-modal";

export default function RolePage() {
  const [roleModalPros, setRoleModalProps] = useState<RoleModalProps>();
  const [permissionModalProps, setPermissionModalProps] =
    useState<PermissionModalProps>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取角色列表
  const fetchRoles = async (params?: RoleSearchParams) => {
    try {
      setLoading(true);
      const response = await roleService.getRoleList({
        pageNumber: params?.pageNumber || pagination.current,
        pageSize: params?.pageSize || pagination.pageSize,
        statusId: params?.statusId,
        name: params?.name,
      });

      setRoles(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
        current: params?.pageNumber || prev.current,
      }));
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      message.error("获取角色列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    fetchRoles();
  }, []);

  // 处理分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
    fetchRoles({ pageNumber: page, pageSize });
  };

  // 删除角色
  const handleDeleteRole = async (id: string) => {
    try {
      await roleService.deleteRole(id);
      message.success("删除成功");
      // 重新加载数据
      fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
      message.error("删除失败");
    }
  };

  // 配置权限
  const onConfigurePermission = (role: Role) => {
    setPermissionModalProps({
      role,
      show: true,
      onOk: () => {
        setPermissionModalProps(undefined);
        message.success("权限配置更新成功");
        // 可选：重新加载角色数据以获取最新权限信息
        fetchRoles();
      },
      onCancel: () => {
        setPermissionModalProps(undefined);
      },
    });
  };

  const columns: ColumnsType<Role> = [
    {
      title: "Name",
      dataIndex: "name",
      width: 300,
    },
    {
      title: "Label",
      dataIndex: "label",
    },
    {
      title: "Code",
      dataIndex: "code",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 120,
      render: (status) => (
        <Tag color={status === "Active" ? "success" : "error"}>{status}</Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (text) => text || "-",
    },
    {
      title: "Creation Time",
      dataIndex: "creationTime",
      width: 160,
      render: (time) => (time ? new Date(time).toLocaleString() : "-"),
    },
    {
      title: "Action",
      key: "operation",
      align: "center",
      width: 150,
      render: (_, record) => (
        <div className="flex w-full justify-center text-gray gap-1">
          <IconButton onClick={() => onEdit(record)} title="编辑角色">
            <Iconify icon="solar:pen-bold-duotone" size={18} />
          </IconButton>
          <IconButton
            onClick={() => onConfigurePermission(record)}
            title="配置权限"
            className="text-blue-600"
          >
            <Iconify icon="solar:settings-bold-duotone" size={18} />
          </IconButton>
          <Popconfirm
            title="Delete the Role"
            description="Are you sure you want to delete this role?"
            okText="Yes"
            cancelText="No"
            placement="left"
            onConfirm={() => handleDeleteRole(record.id)}
          >
            <IconButton title="删除角色">
              <Iconify
                icon="mingcute:delete-2-fill"
                size={18}
                className="text-error"
              />
            </IconButton>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onEdit = (formValue: Role) => {
    setRoleModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit",
      formValue,
      onOk: async () => {
        // 编辑成功后重新加载数据
        await fetchRoles();
        setRoleModalProps(undefined);
      },
      onCancel: () => {
        setRoleModalProps(undefined);
      },
    }));
  };

  const onCreate = () => {
    setRoleModalProps({
      formValue: {
        id: "",
        name: "",
        label: "",
        status: "Active",
        statusId: "",
      },
      title: "Create Role",
      show: true,
      onOk: async () => {
        // 创建成功后重新加载数据
        await fetchRoles();
        setRoleModalProps(undefined);
      },
      onCancel: () => {
        setRoleModalProps(undefined);
      },
    });
  };

  return (
    <Card
      title="Role List"
      extra={
        <Button type="primary" onClick={onCreate}>
          New
        </Button>
      }
    >
      <Table
        rowKey="id"
        size="small"
        scroll={{ x: "max-content" }}
        loading={loading}
        columns={columns}
        dataSource={roles}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          onChange: handleTableChange,
          onShowSizeChange: handleTableChange,
        }}
      />

      {roleModalPros && <RoleModal {...roleModalPros} />}
      {permissionModalProps && <PermissionModal {...permissionModalProps} />}
    </Card>
  );
}
