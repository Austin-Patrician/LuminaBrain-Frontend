import { Button, Form, Input, Modal, Radio, Steps, type FormInstance, Select } from "antd";
import { useState, useEffect } from "react";
import type { Application } from "#/entity";

type StepFormModalProps = {
	title: string;
	open: boolean;
	formValue: Partial<Application>;
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

export default function StepFormModal({ title, open, formValue, onOk, onCancel, form }: StepFormModalProps) {
	const [currentStep, setCurrentStep] = useState(0);

	// Reset step when modal closes
	useEffect(() => {
		if (!open) {
			setCurrentStep(0);
		}
	}, [open]);

	const nextStep = () => {
		// Only validate fields from the current step
		const currentFieldsToValidate = currentStep === 0 ? ["name", "type", "statusId"] : ["prompt"];

		form
			.validateFields(currentFieldsToValidate)
			.then(() => {
				setCurrentStep(currentStep + 1);
			})
			.catch((errorInfo) => {
				console.log("Validation failed:", errorInfo);
			});
	};

	const prevStep = () => {
		setCurrentStep(currentStep - 1);
	};

	const handleSubmit = () => {
		form
			.validateFields()
			.then((values) => {
				console.log("Form values:", values);
				onOk();
				setCurrentStep(0); // Reset to first step after submission
			})
			.catch((errorInfo) => {
				console.log("Validation failed:", errorInfo);
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
			<Form.Item<Application>
				label="Name"
				name="name"
				rules={[{ required: true, message: "Please input the application name!" }]}
			>
				<Input />
			</Form.Item>

			<Form.Item<Application>
				label="Type"
				name="type"
				rules={[{ required: true, message: "Please input the application type!" }]}
			>
				<Select>
					<Select.Option value="chat">Chat</Select.Option>
					<Select.Option value="knowledge">Knowledge Base</Select.Option>
					<Select.Option value="other">Other</Select.Option>
				</Select>
			</Form.Item>

			<Form.Item<Application>
				label="Status"
				name="statusId"
				rules={[{ required: true, message: "Please select a status!" }]}
			>
				<Radio.Group>
					<Radio value="DE546396-5B62-41E5-8814-4C072C74F26A">Enable</Radio>
					<Radio value="DISABLED_STATUS_ID">Disable</Radio>
				</Radio.Group>
			</Form.Item>

			<Form.Item<Application> label="Description" name="description">
				<Input.TextArea rows={4} />
			</Form.Item>

			<Form.Item<Application> label="Chat Model" name="ChatModelId">
				<Input />
			</Form.Item>

			<Form.Item<Application> label="Embedding Model" name="embeddingModelID">
				<Input />
			</Form.Item>
		</div>
	);

	const AdvancedSettingsForm = (
		<div className="py-6">
			<Form.Item label="Prompt" name="prompt">
				<Input.TextArea rows={6} placeholder="Enter system prompt for the application..." />
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
