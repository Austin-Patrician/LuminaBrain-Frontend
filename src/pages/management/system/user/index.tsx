import { Button, Card, Input, Popconfirm, Tag } from "antd";
import Table, { type ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { IconButton, Iconify } from "@/components/icon";
import { useTheme } from "@/theme/hooks";
import userService, { type UserPageReq } from "@/api/services/userService";

import type { UserInfo } from "#/entity";
import { BasicStatus } from "#/enum";

import UserModal from "./user-modal";

export default function UserPage() {
  const { t } = useTranslation();
  const { themeTokens } = useTheme();
  const [userModalProps, setUserModalProps] = useState<UserModalProps>();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState<string>("");

  // 获取用户列表
  const fetchUsers = async (params?: Partial<UserPageReq>) => {
    setLoading(true);
    try {
      const requestParams: UserPageReq = {
        userName: searchText || null,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        ...params,
      };
      
      const response = await userService.getUsersPage(requestParams);
      setUsers(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchUsers({
      userName: searchText || null,
      pageNumber: 1,
      pageSize: pagination.pageSize,
    });
  };

  const handleTableChange = (paginationInfo: any) => {
    setPagination({
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    });
  };

  const columns: ColumnsType<UserInfo> = [
    {
      title: "Name",
      dataIndex: "userName",
      width: 300,
      render: (_, record) => {
        return (
          <div className="flex">
            <img
              alt=""
              src={record.avatar}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-2 flex flex-col">
              <span className="text-sm">{record.userName}</span>
              <span
                style={{ color: themeTokens.color.text.secondary }}
                className="text-xs"
              >
                {record.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: t("sys.login.password"),
      dataIndex: "password",
      width: 120,
      render: () => "********",
    },
    {
      title: t("sys.menu.user.role"),
      dataIndex: "role",
      align: "center",
      width: 120,
      render: (role) => <Tag color="cyan">{role?.name}</Tag>,
    },
    {
      title: t("sys.menu.user.status"),
      dataIndex: "status",
      align: "center",
      width: 120,
      render: (status) => (
        <Tag color={status === BasicStatus.DISABLE ? "error" : "success"}>
          {status === BasicStatus.DISABLE ? "Disable" : "Enable"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "operation",
      align: "center",
      width: 100,
      render: (_, record) => (
        <div className="flex w-full justify-center text-gray">
          <IconButton
            onClick={() => {
              setUserModalProps({
                formValue: record,
                title: "Edit",
                show: true,
                onOk: onEditUser,
                onCancel: () => setUserModalProps(undefined),
              });
            }}
          >
            <Iconify icon="solar:pen-bold-duotone" size={18} />
          </IconButton>
          <Popconfirm
            title="Delete the User"
            okText="Yes"
            cancelText="No"
            placement="left"
            onConfirm={() => {
              console.log("Delete user:", record.id);
            }}
          >
            <IconButton>
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

  const onEditUser = () => {
    setUserModalProps((prev) => ({ ...prev!, show: false }));
  };

  return (
    <Card
      title="User Management"
      extra={
        <div className="flex gap-2">
          <Input.Search
            placeholder="Search by username"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            onClick={() => {
              setUserModalProps({
                formValue: {} as UserInfo,
                title: "Create",
                show: true,
                onOk: onEditUser,
                onCancel: () => setUserModalProps(undefined),
              });
            }}
          >
            New
          </Button>
        </div>
      }
    >
      <Table
        rowKey="id"
        size="small"
        scroll={{ x: "max-content" }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        columns={columns}
        dataSource={users}
        loading={loading}
        onChange={handleTableChange}
      />
      {userModalProps && <UserModal {...userModalProps} />}
    </Card>
  );
}

export type UserModalProps = {
  formValue: UserInfo;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
};
