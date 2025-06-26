import { Button, Card, Popconfirm } from "antd";
import Table, { type ColumnsType } from "antd/es/table";
import { useState } from "react";

import { IconButton, Iconify } from "@/components/icon";
import ProTag from "@/theme/antd/components/tag";

import type { Role } from "#/entity";
import { BasicStatus } from "#/enum";

import RoleModal, { type RoleModalProps } from "./role-modal";

// Mock role data for demonstration - replace with real API calls
const mockRoles: Role[] = [
	{
		id: "1",
		name: "Admin",
		label: "admin",
		status: BasicStatus.ENABLE,
		order: 1,
		desc: "Administrator role with full permissions",
	},
	{
		id: "2",
		name: "User",
		label: "user",
		status: BasicStatus.ENABLE,
		order: 2,
		desc: "Regular user role with limited permissions",
	},
];

export default function RolePage() {
	const [roleModalPros, setRoleModalProps] = useState<RoleModalProps>();

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
		{ title: "Order", dataIndex: "order", width: 60 },
		{
			title: "Status",
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status) => (
				<ProTag
					color={status === BasicStatus.DISABLE ? "error" : "success"}
					variant="light"
				>
					{status === BasicStatus.DISABLE ? "Disable" : "Enable"}
				</ProTag>
			),
		},
		{ title: "Desc", dataIndex: "desc" },
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray">
					<IconButton onClick={() => onEdit(record)}>
						<Iconify icon="solar:pen-bold-duotone" size={18} />
					</IconButton>
					<Popconfirm
						title="Delete the Role"
						okText="Yes"
						cancelText="No"
						placement="left"
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

	const onEdit = (formValue: Role) => {
		setRoleModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit",
			formValue,
		}));
	};

	return (
		<Card
			title="Role List"
			extra={
				<Button
					type="primary"
					onClick={() => {
						setRoleModalProps({
							formValue: {
								id: "",
								name: "",
								label: "",
								status: BasicStatus.ENABLE,
							},
							title: "Create Role",
							open: true,
							onOk: onEdit,
							onCancel: () => {
								setRoleModalProps(undefined);
							},
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
				dataSource={mockRoles}
			/>

			<RoleModal {...roleModalPros} />
		</Card>
	);
}
