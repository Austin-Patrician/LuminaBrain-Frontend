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
} from "antd";
import { useEffect, useState } from "react";

import applicationService from "@/api/services/applicationService";
import { IconButton, Iconify } from "@/components/icon";
import StepFormModal from "@/components/organization/StepFormModal";

import type { Organization } from "#/entity";

const { Title, Paragraph } = Typography;

type SearchFormFieldType = Pick<Organization, "name" | "status">;

export default function ApplicationPage() {
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [searchParams, setSearchParams] = useState<SearchFormFieldType>({});
	const queryClient = useQueryClient();
	
	const [organizationModalPros, setOrganizationModalProps] =
		useState<OrganizationModalProps>({
			formValue: {
				id: "",
				name: "",
				status: "enable",
				prompt: "",
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
				setOrganizationModalProps((prev) => ({ ...prev, show: false }));
			},
		});

	// Query for fetching applications with search params
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["applications", searchParams],
		queryFn: () => applicationService.getApplicationList(searchParams),
	});

	// Mutations for create, update, delete
	const createApplication = useMutation({
		mutationFn: applicationService.createApplication,
		onSuccess: () => {
			message.success("Application created successfully");
			setOrganizationModalProps((prev) => ({ ...prev, show: false }));
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => {
			message.error(`Failed to create application: ${error}`);
		}
	});

	const updateApplication = useMutation({
		mutationFn: applicationService.updateApplication,
		onSuccess: () => {
			message.success("Application updated successfully");
			setOrganizationModalProps((prev) => ({ ...prev, show: false }));
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => {
			message.error(`Failed to update application: ${error}`);
		}
	});

	const deleteApplication = useMutation({
		mutationFn: applicationService.deleteApplication,
		onSuccess: () => {
			message.success("Application deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => {
			message.error(`Failed to delete application: ${error}`);
		}
	});

	const onSearch = () => {
		const values = searchForm.getFieldsValue();
		setSearchParams(values);
	};

	const onSearchFormReset = () => {
		searchForm.resetFields();
		setSearchParams({});
	};

	const onCreate = () => {
		setOrganizationModalProps((prev) => ({
			...prev,
			show: true,
			title: "Create New",
			formValue: {
				...prev.formValue,
				id: "",
				name: "",
				order: 1,
				desc: "",
				status: "enable",
				prompt: "",
			},
		}));
	};

	const onEdit = (formValue: Organization) => {
		setOrganizationModalProps((prev) => ({
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

	const onShare = (org: Organization) => {
		Modal.info({
			title: "Share Organization",
			content: `Share link for "${org.name}" has been copied to clipboard.`,
		});
		// Implement actual share logic here
	};

	useEffect(() => {
		if (organizationModalPros.show) {
			form.setFieldsValue(organizationModalPros.formValue);
		}
	}, [organizationModalPros.formValue, organizationModalPros.show, form]);

	return (
		<Space direction="vertical" size="large" className="w-full">
			<Card>
				<Form form={searchForm}>
					<Row gutter={[16, 16]}>
						<Col span={24} lg={6}>
							<Form.Item<SearchFormFieldType>
								label="Name"
								name="name"
								className="!mb-0"
							>
								<Input />
							</Form.Item>
						</Col>
						<Col span={24} lg={6}>
							<Form.Item<SearchFormFieldType>
								label="Status"
								name="status"
								className="!mb-0"
							>
								<Select>
									<Select.Option value="enable">
										<Tag color="success">Enable</Tag>
									</Select.Option>
									<Select.Option value="disable">
										<Tag color="error">Disable</Tag>
									</Select.Option>
								</Select>
							</Form.Item>
						</Col>
						<Col span={24} lg={12}>
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
				title="Organization List"
				extra={
					<Button type="primary" onClick={onCreate}>
						New
					</Button>
				}
				loading={isLoading}
			>
				<Row gutter={[16, 16]}>
					{data?.map((org) => (
						<Col xs={24} sm={12} md={8} xl={6} key={org.id}>
							<Card hoverable className="h-full">
								<div className="mb-2 flex items-center justify-between">
									<Title level={5} className="m-0">{org.name}</Title>
									<Tag color={org.status === "enable" ? "success" : "error"}>
										{org.status}
									</Tag>
								</div>
								<div className="mb-3">
									<span className="text-sm text-gray-500">Order: </span>
									<span>{org.order}</span>
								</div>
								<Paragraph className="mb-4" ellipsis={{ rows: 2 }}>
									{org.desc || "No description available"}
								</Paragraph>
								<div className="flex justify-end space-x-2 pt-2 border-t">
									<IconButton onClick={() => onEdit(org)}>
										<Iconify icon="solar:pen-bold-duotone" size={18} />
									</IconButton>
									<IconButton onClick={() => onShare(org)}>
										<Iconify icon="solar:share-bold-duotone" size={18} />
									</IconButton>
									<Popconfirm
										title="Delete the Organization"
										okText="Yes"
										cancelText="No"
										placement="left"
										onConfirm={() => onDelete(org.id)}
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
							</Card>
						</Col>
					))}
					{data && data.length === 0 && (
						<Col span={24}>
							<div className="flex justify-center p-8 text-gray-500">
								No applications found
							</div>
						</Col>
					)}
				</Row>
			</Card>
			<StepFormModal 
				title={organizationModalPros.title}
				open={organizationModalPros.show}
				formValue={organizationModalPros.formValue}
				onOk={organizationModalPros.onOk}
				onCancel={organizationModalPros.onCancel}
				form={form}
			/>
		</Space>
	);
}

type OrganizationModalProps = {
	formValue: Organization & { prompt?: string };
	title: string;
	show: boolean;
	onOk: VoidFunction;
	onCancel: VoidFunction;
};
