import { Form, Input, Modal, Radio, Select, message } from "antd";
import { useEffect, useState } from "react";

import type { UserInfo, Role } from "#/entity";
import { BasicStatus } from "#/enum";
import roleService from "@/api/services/roleService";

export type UserModalProps = {
  formValue: UserInfo;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
};

export default function UserModal({
  title,
  show,
  formValue,
  onOk,
  onCancel,
}: UserModalProps) {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    // 设置表单初始值
    if (formValue) {
      form.setFieldsValue({ ...formValue });
    }
  }, [formValue, form, roles]);

  // 获取角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      if (!show) return; // 只有在模态框显示时才获取角色数据
      
      setLoadingRoles(true);
      try {
        const response = await roleService.getRoleList({
          pageNumber: 1,
          pageSize: 100, // 获取所有角色，假设不会超过100个
        });
        setRoles(response.data); // 注意这里是 response.data.data
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        message.error("获取角色列表失败");
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [show]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("User form values:", values);
      message.success(formValue?.id ? "用户更新成功" : "用户创建成功");
      onOk();
    } catch (error) {
      console.error("Failed to save user:", error);
      message.error(formValue?.id ? "用户更新失败" : "用户创建失败");
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
        <Form.Item<UserInfo>
          label="Username"
          name="userName"
          rules={[{ required: true, message: "Please input username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item<UserInfo>
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        {!formValue?.id && (
          <Form.Item<UserInfo>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
        )}

        <Form.Item<UserInfo>
          label="Role"
          name={["role", "id"]}
          rules={[{ required: true, message: "Please select role!" }]}
        >
          <Select 
            placeholder="Select role" 
            loading={loadingRoles}
            disabled={loadingRoles}
          >
            {roles.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item<UserInfo>
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select status!" }]}
          initialValue={BasicStatus.ENABLE}
        >
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value={BasicStatus.ENABLE}>Enable</Radio>
            <Radio value={BasicStatus.DISABLE}>Disable</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item<UserInfo> label="Avatar URL" name="avatar">
          <Input placeholder="Enter avatar URL (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
