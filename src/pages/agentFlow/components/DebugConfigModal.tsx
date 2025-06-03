import React, { useState } from 'react';
import {
  Modal,
  Form,
  Switch,
  InputNumber,
  Select,
  Divider,
  Space,
  Button,
  Typography,
  Card,
  Tooltip
} from 'antd';
import { SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface DebugConfig {
  stepByStep: boolean;
  autoStop: boolean;
  maxExecutionTime: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  simulateDelay: boolean;
  delayRange: [number, number];
  mockResponses: boolean;
  breakpoints: string[];
}

interface DebugConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (config: DebugConfig) => void;
  currentConfig: DebugConfig;
}

const DebugConfigModal: React.FC<DebugConfigModalProps> = ({
  visible,
  onClose,
  onSave,
  currentConfig
}) => {
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then(values => {
      onSave({
        ...currentConfig,
        ...values
      });
      onClose();
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <SettingOutlined className="text-blue-500" />
          <span>调试配置</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          保存配置
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={currentConfig}
        className="space-y-4"
      >
        <Card size="small" title="执行控制" className="mb-4">
          <Form.Item
            name="stepByStep"
            valuePropName="checked"
            extra="启用后每个节点执行完会暂停，等待手动继续"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text>步进执行</Text>
                <Tooltip title="逐步执行每个节点，便于详细观察执行过程">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
              <Switch />
            </div>
          </Form.Item>

          <Form.Item
            name="autoStop"
            valuePropName="checked"
            extra="遇到错误时自动停止执行"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text>错误时自动停止</Text>
                <Tooltip title="当任何节点执行失败时自动停止整个工作流">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
              <Switch />
            </div>
          </Form.Item>

          <Form.Item
            name="maxExecutionTime"
            label={
              <div className="flex items-center gap-2">
                <Text>最大执行时间 (秒)</Text>
                <Tooltip title="单个节点的最大执行时间限制">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
            }
            extra="超过此时间将强制停止节点执行"
          >
            <InputNumber min={1} max={300} className="w-full" />
          </Form.Item>
        </Card>

        <Card size="small" title="模拟设置" className="mb-4">
          <Form.Item
            name="simulateDelay"
            valuePropName="checked"
            extra="模拟真实API调用的延迟时间"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text>模拟延迟</Text>
                <Tooltip title="为每个节点添加随机延迟，模拟真实执行环境">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
              <Switch />
            </div>
          </Form.Item>

          <Form.Item
            name="delayRange"
            label="延迟范围 (毫秒)"
            extra="随机延迟的最小值和最大值"
          >
            <Space.Compact className="w-full">
              <InputNumber placeholder="最小值" className="w-1/2" />
              <InputNumber placeholder="最大值" className="w-1/2" />
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="mockResponses"
            valuePropName="checked"
            extra="使用模拟数据代替真实API调用"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text>模拟响应</Text>
                <Tooltip title="使用预设的模拟数据，避免调用真实的外部服务">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
              <Switch />
            </div>
          </Form.Item>
        </Card>

        <Card size="small" title="日志设置" className="mb-4">
          <Form.Item
            name="logLevel"
            label={
              <div className="flex items-center gap-2">
                <Text>日志级别</Text>
                <Tooltip title="控制调试信息的详细程度">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
            }
            extra="选择要显示的日志详细程度"
          >
            <Select className="w-full">
              <Option value="debug">Debug - 最详细</Option>
              <Option value="info">Info - 一般信息</Option>
              <Option value="warn">Warn - 警告信息</Option>
              <Option value="error">Error - 仅错误</Option>
            </Select>
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
};

export default DebugConfigModal;