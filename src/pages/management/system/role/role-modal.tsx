import { Form, Input, Modal, Radio, TreeSelect, message } from "antd";
import { useEffect, useState } from "react";

import type { Permission, Role } from "#/entity";
import roleService, {
  type CreateRoleDto,
  type UpdateRoleDto,
} from "@/api/services/roleService";

export type RoleModalProps = {
  formValue: Role;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
};

export default function RoleModal({
  title,
  show,
  formValue,
  onOk,
  onCancel,
}: RoleModalProps) {
  const [form] = Form.useForm();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  // 加载权限数据
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        // 这里应该调用实际的权限API
        // const response = await permissionService.getPermissionList();
        // setPermissions(response.data);

        // 临时使用空数组，待权限API实现后替换
        setPermissions([]);
      } catch (error) {
        console.error("Failed to load permissions:", error);
        message.error("加载权限数据失败");
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      loadPermissions();
    }
  }, [show]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (formValue.id) {
        // 更新角色
        const updateData: UpdateRoleDto = {
          id: formValue.id,
          name: values.name,
          label: values.label,
          description: values.description,
          code: values.code,
          order: values.order ? Number(values.order) : undefined,
          statusId:
            values.status === "Active"
              ? "DE546396-5B62-41E5-8814-4C072C74F26A"
              : "DISABLED_STATUS_ID",
        };

        await roleService.updateRole(updateData);
        message.success("角色更新成功");
      } else {
        // 创建角色
        const createData: CreateRoleDto = {
          name: values.name,
          label: values.label,
          description: values.description,
          code: values.code,
          order: values.order ? Number(values.order) : undefined,
          statusId:
            values.status === "Active"
              ? "DE546396-5B62-41E5-8814-4C072C74F26A"
              : "DISABLED_STATUS_ID",
        };

        await roleService.createRole(createData);
        message.success("角色创建成功");
      }

      onOk();
    } catch (error) {
      console.error("Failed to save role:", error);
      message.error(formValue.id ? "角色更新失败" : "角色创建失败");
    }
  };

  return (
    <Modal
      title={title}
      open={show}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
    >
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        layout="horizontal"
      >
        <Form.Item<Role>
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input role name!" }]}
        >
          <Input placeholder="Enter role name" />
        </Form.Item>
        <Form.Item<Role>
          label="Label"
          name="label"
          rules={[{ required: true, message: "Please input role label!" }]}
        >
          <Input placeholder="Enter role label" />
        </Form.Item>
        <Form.Item<Role> label="Code" name="code">
          <Input placeholder="Enter role code" />
        </Form.Item>
        <Form.Item<Role>
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select status!" }]}
          initialValue="Active"
        >
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value="Active">Active</Radio>
            <Radio value="Inactive">Inactive</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item<Role> label="Order" name="order">
          <Input type="number" placeholder="Enter order number" />
        </Form.Item>
        <Form.Item<Role> label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Enter role description" />
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
            placeholder="Please select permissions"
            loading={loading}
            treeData={permissions}
            disabled={permissions.length === 0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
