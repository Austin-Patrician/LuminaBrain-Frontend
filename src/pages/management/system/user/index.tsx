import { Button, Card, Popconfirm } from "antd";
import Table, { type ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { IconButton, Iconify } from "@/components/icon";
import ProTag from "@/theme/antd/components/tag";
import { useTheme } from "@/theme/hooks";

import type { UserInfo } from "#/entity";
import { BasicStatus } from "#/enum";

import UserModal from "./user-modal";

// Mock user data for demonstration - replace with real API calls
const mockUsers: UserInfo[] = [
	{
		id: "1",
		username: "admin",
		email: "admin@example.com",
		avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
		status: BasicStatus.ENABLE,
		role: {
			id: "1",
			name: "Admin",
			label: "admin",
			status: BasicStatus.ENABLE,
		},
	},
	{
		id: "2",
		username: "user",
		email: "user@example.com",
		avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2",
		status: BasicStatus.ENABLE,
		role: {
			id: "2",
			name: "User",
			label: "user",
			status: BasicStatus.ENABLE,
		},
	},
];

export default function UserPage() {
	const { t } = useTranslation();
	const { themeTokens } = useTheme();
	const [userModalProps, setUserModalProps] = useState<UserModalProps>();

	const columns: ColumnsType<UserInfo> = [
		{
			title: "Name",
			dataIndex: "username",
			width: 300,
			render: (_, record) => {
				return (
					<div className="flex">
						<img alt="" src={record.avatar} className="h-10 w-10 rounded-full" />
						<div className="ml-2 flex flex-col">
							<span className="text-sm">{record.username}</span>
							<span style={{ color: themeTokens.color.text.secondary }} className="text-xs">
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
			title: t("sys.user.role"),
			dataIndex: "role",
			align: "center",
			width: 120,
			render: (role) => <ProTag color="cyan">{role?.name}</ProTag>,
		},
		{
			title: t("sys.user.status"),
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status) => (
				<ProTag color={status === BasicStatus.DISABLE ? "error" : "success"}>
					{status === BasicStatus.DISABLE ? "Disable" : "Enable"}
				</ProTag>
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
							<Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
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
				<Button
					type="primary"
					onClick={() => {
						setUserModalProps({
							formValue: {},
							title: "Create",
							show: true,
							onOk: onEditUser,
							onCancel: () => setUserModalProps(undefined),
						});
					}}
				>
					New
				</Button>
			}
		>
			<Table
				rowKey="id"
				size="small"
				scroll={{ x: "max-content" }}
				pagination={false}
				columns={columns}
				dataSource={mockUsers}
			/>
			<UserModal {...userModalProps} />
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
