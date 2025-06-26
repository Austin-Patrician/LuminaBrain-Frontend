import { Form, Input, Modal, Radio, TreeSelect } from "antd";
import { useEffect } from "react";

import type { Permission, Role } from "#/entity";
import { BasicStatus, PermissionType } from "#/enum";

// Mock permission data for demonstration - replace with real API calls
const mockPermissions: Permission[] = [
	{
		id: "1",
		parentId: "",
		name: "Dashboard",
		label: "sys.menu.dashboard",
		type: PermissionType.CATALOGUE,
		route: "dashboard",
		icon: "ic-analysis",
		order: 1,
		children: [
			{
				id: "2",
				parentId: "1",
				name: "Workbench",
				label: "sys.menu.workbench",
				type: PermissionType.MENU,
				route: "workbench",
				component: "/dashboard/workbench/index.tsx",
			},
		],
	},
];

export type RoleModalProps = {
	formValue: Role;
	title: string;
	show: boolean;
	onOk: VoidFunction;
	onCancel: VoidFunction;
};

export default function RoleModal({ title, show, formValue, onOk, onCancel }: RoleModalProps) {
	const [form] = Form.useForm();

	useEffect(() => {
		form.setFieldsValue({ ...formValue });
	}, [formValue, form]);

	return (
		<Modal title={title} open={show} onOk={onOk} onCancel={onCancel}>
			<Form
				initialValues={formValue}
				form={form}
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 18 }}
				layout="horizontal"
			>
				<Form.Item<Role> label="Name" name="name" required>
					<Input />
				</Form.Item>
				<Form.Item<Role> label="Label" name="label" required>
					<Input />
				</Form.Item>
				<Form.Item<Role> label="Status" name="status" required>
					<Radio.Group optionType="button" buttonStyle="solid">
						<Radio value={BasicStatus.ENABLE}>Enable</Radio>
						<Radio value={BasicStatus.DISABLE}>Disable</Radio>
					</Radio.Group>
				</Form.Item>
				<Form.Item<Role> label="Order" name="order">
					<Input />
				</Form.Item>
				<Form.Item<Role> label="Desc" name="desc">
					<Input.TextArea />
				</Form.Item>
				<Form.Item<Role> label="Permission" name="permission">
					<TreeSelect
						fieldNames={{
							label: "name",
							value: "id",
						}}
						treeDefaultExpandAll
						multiple
						allowClear
						treeCheckable
						placeholder="Please select"
						treeData={mockPermissions}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}
