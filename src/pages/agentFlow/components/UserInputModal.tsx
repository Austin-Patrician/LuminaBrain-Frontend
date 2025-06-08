import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Form, Typography, Card } from 'antd';
import { UserOutlined, RobotOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { UserInputRequest, UserInputResponse } from '@/types/executionPlan';
import Scrollbar from '@/components/scrollbar';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface UserInputModalProps {
  visible: boolean;
  request: UserInputRequest | null;
  onSubmit: (response: UserInputResponse) => void;
  onCancel: () => void;
}

const UserInputModal: React.FC<UserInputModalProps> = ({
  visible,
  request,
  onSubmit,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [inputValue, setInputValue] = useState<any>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (request && visible) {
      // 重置表单和状态
      form.resetFields();
      setInputValue(request.inputConfig.defaultValue || '');
      setIsSubmitting(false);
    }
  }, [request, visible, form]);

  const handleSubmit = async () => {
    if (!request) return;

    try {
      setIsSubmitting(true);

      // 验证输入
      await form.validateFields();

      const response: UserInputResponse = {
        stepId: request.stepId,
        value: inputValue,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      };

      onSubmit(response);
    } catch (error) {
      console.error('用户输入验证失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setInputValue('');
    form.resetFields();
    onCancel();
  };

  const renderInputField = () => {
    if (!request) return null;

    const { inputConfig } = request;

    switch (inputConfig.type) {
      case 'text':
        return (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputConfig.placeholder}
            size="large"
            maxLength={inputConfig.validation?.max}
          />
        );

      case 'textarea':
        return (
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputConfig.placeholder}
            rows={4}
            maxLength={inputConfig.validation?.max}
          />
        );

      case 'select':
        return (
          <Select
            value={inputValue}
            onChange={setInputValue}
            placeholder={inputConfig.placeholder}
            size="large"
            style={{ width: '100%' }}
          >
            {inputConfig.options?.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'json':
        return (
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputConfig.placeholder || '{"key": "value"}'}
            rows={6}
            style={{ fontFamily: 'monospace' }}
          />
        );

      case 'confirm':
        return (
          <div className="flex gap-3">
            <Button
              type="primary"
              size="large"
              onClick={() => setInputValue(true)}
              className={inputValue === true ? 'bg-green-500' : ''}
            >
              确认继续
            </Button>
            <Button
              size="large"
              onClick={() => setInputValue(false)}
              className={inputValue === false ? 'bg-red-500 text-white' : ''}
            >
              取消执行
            </Button>
          </div>
        );

      default:
        return (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputConfig.placeholder}
            size="large"
          />
        );
    }
  };

  const renderPreviousData = () => {
    if (!request?.inputConfig.showPreviousData || !request.previousData) {
      return null;
    }

    const { previousData, inputConfig } = request;

    // 过滤要显示的数据
    let dataToShow = previousData;
    if (inputConfig.previousDataKeys && inputConfig.previousDataKeys.length > 0) {
      dataToShow = {};
      inputConfig.previousDataKeys.forEach(key => {
        if (previousData[key] !== undefined) {
          dataToShow[key] = previousData[key];
        }
      });
    }

    return (
      <Card
        size="small"
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-blue-500" />
            <Text strong>上一步执行结果</Text>
          </div>
        }
        className="mb-4"
      >
        <div className="max-h-48 overflow-auto">
          <Scrollbar>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
              {JSON.stringify(dataToShow, null, 2)}
            </pre>
          </Scrollbar>
        </div>
      </Card>
    );
  };

  const renderNodeInfo = () => {
    if (!request) return null;

    return (
      <Card size="small" className="mb-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserOutlined className="text-blue-600" />
          </div>
          <div className="flex-1">
            <Text strong className="text-blue-800">
              {request.nodeName}
            </Text>
            <div className="text-sm text-blue-600 mt-1">
              节点类型: {request.nodeType} | 步骤ID: {request.stepId}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // 如果没有请求且不可见，则不渲染
  if (!request && !visible) return null;

  // 如果没有请求但可见，显示加载状态的模态框
  if (!request) {
    return (
      <Modal
        title="等待用户输入"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Text className="text-gray-500">正在准备用户输入...</Text>
          </div>
        </div>
      </Modal>
    );
  }

  const { inputConfig } = request;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined className="text-blue-500" />
          <span>{inputConfig.label}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={
        inputConfig.type === 'confirm' ? null : [
          <Button key="cancel" onClick={handleCancel} size="large">
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            size="large"
            disabled={inputConfig.required && !inputValue}
          >
            确认
          </Button>
        ]
      }
      destroyOnClose
      maskClosable={false}
    >
      <div className="space-y-4">
        {/* 节点信息 */}
        {renderNodeInfo()}

        {/* 上一步结果 */}
        {renderPreviousData()}

        {/* 输入说明 */}
        {inputConfig.description && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <InfoCircleOutlined className="text-yellow-600 mt-0.5" />
            <Text className="text-yellow-800">{inputConfig.description}</Text>
          </div>
        )}

        {/* 输入字段 */}
        <Form form={form} layout="vertical">
          <Form.Item
            name="userInput"
            label={inputConfig.type !== 'confirm' ? inputConfig.label : undefined}
            rules={[
              inputConfig.required ? {
                required: true,
                message: inputConfig.validation?.message || `请输入${inputConfig.label}`
              } : undefined,
              inputConfig.validation?.pattern ? {
                pattern: new RegExp(inputConfig.validation.pattern),
                message: inputConfig.validation.message || '输入格式不正确'
              } : undefined,
              inputConfig.validation?.min ? {
                min: inputConfig.validation.min,
                message: `最少输入${inputConfig.validation.min}个字符`
              } : undefined,
              inputConfig.validation?.max ? {
                max: inputConfig.validation.max,
                message: `最多输入${inputConfig.validation.max}个字符`
              } : undefined
            ].filter((rule): rule is any => rule !== undefined)}
          >
            {renderInputField()}
          </Form.Item>
        </Form>

        {/* JSON 格式提示 */}
        {inputConfig.type === 'json' && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <div className="font-medium mb-1">JSON 格式示例:</div>
            <code>{"{"}"name": "张三", "age": 25, "city": "北京"{"}"}</code>
          </div>
        )}

        {/* 字符数统计 */}
        {(inputConfig.type === 'text' || inputConfig.type === 'textarea' || inputConfig.type === 'json') &&
          inputConfig.validation?.max && (
            <div className="text-right text-xs text-gray-500">
              {inputValue?.toString().length || 0} / {inputConfig.validation.max}
            </div>
          )}
      </div>
    </Modal>
  );
};

export default UserInputModal;
