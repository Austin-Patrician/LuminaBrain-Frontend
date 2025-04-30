import {
  Button,
  Form,
  Input, 
  InputNumber,
  Modal,
  Radio,
  Steps,
  type FormInstance
} from "antd";
import { useState, useEffect } from "react";
import type { Organization } from "#/entity";

type StepFormModalProps = {
  title: string;
  open: boolean;
  formValue: Organization & { prompt?: string };
  onOk: () => void;
  onCancel: () => void;
  form: FormInstance;
};

const steps = [
  {
    title: "Application Settings",
    description: "Basic information",
  },
  {
    title: "Advanced Settings",
    description: "Additional options",
  },
];

export default function StepFormModal({
  title,
  open,
  formValue,
  onOk,
  onCancel,
  form,
}: StepFormModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Reset step when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
    }
  }, [open]);

  const nextStep = () => {
    // Only validate fields from the current step
    const currentFieldsToValidate = currentStep === 0 
      ? ['name', 'order', 'status'] 
      : ['prompt'];
      
    form.validateFields(currentFieldsToValidate)
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
      });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    form.validateFields()
      .then((values) => {
        console.log('Form values:', values);
        onOk();
        setCurrentStep(0); // Reset to first step after submission
      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
      });
  };

  // Modified onCancel handler to ensure step reset
  const handleCancel = () => {
    setCurrentStep(0);
    onCancel();
  };

  const renderFooter = () => {
    if (currentStep === 0) {
      return (
        <div className="flex justify-end">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={nextStep} className="ml-2">
            Next
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex justify-end">
        <Button onClick={prevStep}>Previous</Button>
        <Button type="primary" onClick={handleSubmit} className="ml-2">
          Save
        </Button>
      </div>
    );
  };

  const ApplicationSettingsForm = (
    <div className="py-6">
      <Form.Item<Organization> 
        label="Name" 
        name="name" 
        rules={[
          { required: true, message: 'Please input the application name!' }
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item<Organization> 
        label="Order" 
        name="order" 
        rules={[
          { required: true, message: 'Please input the order number!' }
        ]}
      >
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item<Organization> 
        label="Status" 
        name="status" 
        rules={[
          { required: true, message: 'Please select a status!' }
        ]}
      >
        <Radio.Group optionType="button" buttonStyle="solid">
          <Radio value="enable"> Enable </Radio>
          <Radio value="disable"> Disable </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item<Organization> label="Desc" name="desc">
        <Input.TextArea rows={4} />
      </Form.Item>
    </div>
  );

  const AdvancedSettingsForm = (
    <div className="py-6">
      <Form.Item 
        label="Prompt" 
        name="prompt"
        rules={[
          { required: false }  // Change to true if prompt becomes required
        ]}
      >
        <Input.TextArea rows={6} placeholder="Enter configuration prompt..." />
      </Form.Item>
    </div>
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      footer={renderFooter()}
      width={1400}
      centered
      className="step-form-modal"
    >
      <div className="mb-8 mt-4 px-8">
        <Steps current={currentStep} items={steps} />
      </div>
      
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        className="px-8"
      >
        {currentStep === 0 ? ApplicationSettingsForm : AdvancedSettingsForm}
      </Form>
    </Modal>
  );
}
