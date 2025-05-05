import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Button,
	Card,
	Col,
	Form,
	Input,
	Modal,
	Popconfirm,
	Row,
	Select,
	Space,
	Tag,
	Typography,
	message,
	Pagination,
} from "antd";
import { useEffect, useState } from "react";

import applicationService from "@/api/services/applicationService";
import { IconButton, Iconify } from "@/components/icon";
import StepFormModal from "@/components/organization/StepFormModal";

import type { Application } from "#/entity";

const { Title, Paragraph } = Typography;

// 添加应用类型常量
const APPLICATION_TYPES = [
	{ id: "BD5A8BA5-CCB0-4E77-91E6-2D4637F7F26D", name: "Chat" },
	{ id: "A8E78CD3-4FBA-4B33-B996-FE5B04571C00", name: "Knowledge" },
	{ id: "A8E78CD3-4FBA-4B33-B996-FE5B04571C01", name: "Text2SQL" },
];

// 状态ID常量
const STATUS_TYPES = [
	{ id: "DE546396-5B62-41E5-8814-4C072C74F26A", name: "Active" },
	{ id: "DISABLED_STATUS_ID", name: "Inactive" },
];

// 模型类型颜色映射
const MODEL_TAG_COLORS = {
	Chat: "blue",
	Embedding: "green",
	Rerank: "purple",
	Image: "orange",
	Vector: "cyan",
};

// 更新搜索表单类型
type SearchFormFieldType = Pick<Application, "name" | "statusId"> & {
	applicationType: string;
};

export default function ApplicationPage() {
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [searchParams, setSearchParams] = useState<SearchFormFieldType>({
		name: "",
		statusId: "",
		applicationType: "",
	});
	const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
	const queryClient = useQueryClient();

	const [applicationModalProps, setApplicationModalProps] = useState<ApplicationModalProps>({
		formValue: {
			id: "",
			name: "",
			statusId: "DE546396-5B62-41E5-8814-4C072C74F26A",
			description: "",
			type: "",
			prompt: "",
			ChatModelId: "",
			ChatModelName: "",
			embeddingModelID: "",
			embeddingModelName: "",
			status: "enable",
		},
		title: "New",
		show: false,
		onOk: () => {
			const values = form.getFieldsValue();
			if (values.id) {
				updateApplication.mutate(values);
			} else {
				createApplication.mutate(values);
			}
		},
		onCancel: () => {
			setApplicationModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	// Query for fetching applications with search params and pagination
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["applications", searchParams, pagination],
		queryFn: () =>
			applicationService.getApplicationList({
				...searchParams,
				pageNumber: pagination.current,
				pageSize: pagination.pageSize,
			}),
	});

	// 添加调试代码，查看返回的数据结构
	console.log("API返回的数据:", data);

	// 正确访问嵌套数据结构
	const applications: Application[] = data?.data || [];
	const totalCount = data?.total || 0;

	// Mutations for create, update, delete
	const createApplication = useMutation({
		mutationFn: applicationService.createApplication,
		onSuccess: () => {
			message.success("Application created successfully");
			setApplicationModalProps((prev) => ({ ...prev, show: false }));
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => {
			message.error(`Failed to create application: ${error}`);
		},
	});

	const updateApplication = useMutation({
		mutationFn: applicationService.updateApplication,
		onSuccess: () => {
			message.success("Application updated successfully");
			setApplicationModalProps((prev) => ({ ...prev, show: false }));
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => {
			message.error(`Failed to update application: ${error}`);
		},
	});

	const deleteApplication = useMutation({
		mutationFn: applicationService.deleteApplication,
		onSuccess: () => {
			message.success("Application deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => {
			message.error(`Failed to delete application: ${error}`);
		},
	});

	const onSearch = () => {
		const values = searchForm.getFieldsValue();
		setSearchParams(values);
	};

	const onSearchFormReset = () => {
		searchForm.resetFields();
		setSearchParams({ name: "", statusId: "", applicationType: "" });
	};

	const onCreate = () => {
		setApplicationModalProps((prev) => ({
			...prev,
			show: true,
			title: "Create New",
			formValue: {
				...prev.formValue,
				id: "",
				name: "",
				description: "",
				type: "",
				statusId: "DE546396-5B62-41E5-8814-4C072C74F26A",
				prompt: "",
			},
		}));
	};

	const onEdit = (formValue: Application) => {
		setApplicationModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit",
			formValue: {
				...formValue,
				prompt: formValue.prompt || "",
			},
		}));
	};

	const onDelete = (id: string) => {
		deleteApplication.mutate(id);
	};

	const onShare = (app: Application) => {
		Modal.info({
			title: "Share Application",
			content: `Share link for "${app.name}" has been copied to clipboard.`,
		});
		// Implement actual share logic here
	};

	const onPageChange = (page: number, pageSize: number) => {
		setPagination({ current: page, pageSize });
	};

	useEffect(() => {
		if (applicationModalProps.show) {
			form.setFieldsValue(applicationModalProps.formValue);
		}
	}, [applicationModalProps.formValue, applicationModalProps.show, form]);

	return (
		<Space direction="vertical" size="large" className="w-full">
			<Card>
				<Form form={searchForm}>
					<Row gutter={[16, 16]}>
						<Col span={24} lg={6}>
							<Form.Item<SearchFormFieldType> label="Name" name="name" className="!mb-0">
								<Input />
							</Form.Item>
						</Col>
						<Col span={24} lg={6}>
							<Form.Item<SearchFormFieldType> label="Status" name="statusId" className="!mb-0">
								<Select allowClear placeholder="Select Status">
									{STATUS_TYPES.map((status) => (
										<Select.Option key={status.id} value={status.id}>
											<Tag color={status.id === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "success" : "error"}>
												{status.name}
											</Tag>
										</Select.Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={24} lg={6}>
							<Form.Item<SearchFormFieldType> label="Type" name="applicationType" className="!mb-0">
								<Select allowClear placeholder="Select Application Type">
									{APPLICATION_TYPES.map((type) => (
										<Select.Option key={type.id} value={type.id}>
											{type.name}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={24} lg={6}>
							<div className="flex justify-end">
								<Button onClick={onSearchFormReset}>Reset</Button>
								<Button type="primary" className="ml-4" onClick={onSearch}>
									Search
								</Button>
							</div>
						</Col>
					</Row>
				</Form>
			</Card>

			<Card
				title="Application List"
				extra={
					<Button type="primary" onClick={onCreate}>
						New
					</Button>
				}
				loading={isLoading}
			>
				<Row gutter={[24, 24]}>
					{applications.map((app: Application) => (
						<Col xs={24} sm={24} md={12} xl={8} key={app.id}>
							<Card hoverable className="h-full flex flex-col">
								<div className="mb-3 flex items-center justify-between">
									<Title level={5} className="m-0">
										{app.name}
									</Title>
									<Tag color={app.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "success" : "error"}>
										{app.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "Active" : "Inactive"}
									</Tag>
								</div>

								{/* 描述信息 */}
								<Paragraph className="mb-4 text-left" ellipsis={{ rows: 2 }}>
									{app.description || "No description available"}
								</Paragraph>

								{/* 模型信息展示 - 无前缀标签，只显示值 */}
								<div className="mb-4 flex flex-wrap gap-2">
									{app.ChatModelName && <Tag color={MODEL_TAG_COLORS.Chat}>{app.ChatModelName}</Tag>}
									{app.embeddingModelName && <Tag color={MODEL_TAG_COLORS.Embedding}>{app.embeddingModelName}</Tag>}
									{app.rerankModelName && <Tag color={MODEL_TAG_COLORS.Rerank}>{app.rerankModelName}</Tag>}
									{app.imageModelName && <Tag color={MODEL_TAG_COLORS.Image}>{app.imageModelName}</Tag>}
									{app.applicationType && (
										<Tag color="cyan">{APPLICATION_TYPES.find((t) => t.id === app.applicationType)?.name || ""}</Tag>
									)}
									{app.type && app.type !== APPLICATION_TYPES.find((t) => t.id === app.applicationType)?.name && (
										<Tag color="magenta">{app.type}</Tag>
									)}
								</div>

								{/* 操作按钮 */}
								<div className="mt-auto flex justify-end space-x-2 pt-2 border-t">
									<IconButton onClick={() => onEdit(app)}>
										<Iconify icon="solar:pen-bold-duotone" size={18} />
									</IconButton>
									<IconButton onClick={() => onShare(app)}>
										<Iconify icon="solar:share-bold-duotone" size={18} />
									</IconButton>
									<Popconfirm
										title="Delete the Application"
										okText="Yes"
										cancelText="No"
										placement="left"
										onConfirm={() => onDelete(app.id)}
									>
										<IconButton>
											<Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
										</IconButton>
									</Popconfirm>
								</div>
							</Card>
						</Col>
					))}
					{applications.length === 0 && (
						<Col span={24}>
							<div className="flex justify-center p-8 text-gray-500">No applications found</div>
						</Col>
					)}
				</Row>
				{totalCount > 0 && (
					<div className="flex justify-end mt-4">
						<Pagination
							current={pagination.current}
							pageSize={pagination.pageSize}
							total={totalCount}
							onChange={onPageChange}
							showSizeChanger
						/>
					</div>
				)}
			</Card>
			<StepFormModal
				title={applicationModalProps.title}
				open={applicationModalProps.show}
				formValue={applicationModalProps.formValue}
				onOk={applicationModalProps.onOk}
				onCancel={applicationModalProps.onCancel}
				form={form}
			/>
		</Space>
	);
}

type ApplicationModalProps = {
	formValue: Partial<Application>;
	title: string;
	show: boolean;
	onOk: VoidFunction;
	onCancel: VoidFunction;
};
