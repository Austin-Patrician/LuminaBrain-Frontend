import agentService from "@/api/services/agentService";
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Divider,
	Form,
	Input,
	InputNumber,
	List,
	Row,
	Select,
	Space,
	Tag,
	Typography,
	message,
	theme,
} from "antd";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AgentConfig } from "#/dto/application";
import type { Agent } from "#/entity";

const { TextArea } = Input;
const { Text } = Typography;

interface AgentApplicationFormProps {
	form: any;
}

const AgentApplicationForm: React.FC<AgentApplicationFormProps> = ({ form }) => {
	const { t } = useTranslation();
	const [agents, setAgents] = useState<Agent[]>([]);
	const [selectedAgents, setSelectedAgents] = useState<AgentConfig[]>([]);
	const { token } = theme.useToken();

	// 功能选择行为映射
	const FUNCTION_CHOICE_BEHAVIORS = [
		{ id: "7DB033D5-C0C4-4139-9522-24AC58A202AB", name: "自动" },
		{ id: "A665F2CB-4A80-4E79-8A42-D7E612F2A1EC", name: "必需" },
		{ id: "4FFBB956-E037-4D42-8F19-626627911983", name: "无" },
	];

	const cardStyle = {
		marginBottom: 16,
		borderRadius: 8,
		boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
		border: `1px solid ${token.colorBorderSecondary}`,
	};

	const cardHeadStyle = {
		borderBottom: `1px solid ${token.colorBorderSecondary}`,
		padding: "12px 18px",
		fontWeight: 500,
	};

	const cardBodyStyle = {
		padding: "18px",
	};

	// 加载Agent列表
	useEffect(() => {
		const loadAgents = async () => {
			try {
				const agentRes = await agentService.getAgentList({});
				setAgents(agentRes.data || []);
			} catch (error) {
				console.error("加载Agent数据失败", error);
				message.error(t("加载Agent数据失败"));
			}
		};

		loadAgents();
	}, [t]);

	// 监听表单数据变化，同步到本地状态
	useEffect(() => {
		const formAgentConfigs = form.getFieldValue("agentConfigs");
		if (formAgentConfigs && Array.isArray(formAgentConfigs)) {
			setSelectedAgents(formAgentConfigs);
		}
	}, [form]);

	// 添加Agent
	const addAgent = (agentId: string) => {
		const agent = agents.find((a) => a.id === agentId);
		if (!agent) return;

		const newAgentConfig: AgentConfig = {
			agentId: agent.id,
			agentName: agent.name,
			functionChoiceBehavior: "A665F2CB-4A80-4E79-8A42-D7E612F2A1EC", // 默认为"自动"
			order: selectedAgents.length + 1,
		};

		setSelectedAgents([...selectedAgents, newAgentConfig]);
		updateFormValue([...selectedAgents, newAgentConfig]);
	};

	// 删除Agent
	const removeAgent = (index: number) => {
		const newSelectedAgents = selectedAgents.filter((_, i) => i !== index);
		// 重新排序
		const reorderedAgents = newSelectedAgents.map((agent, i) => ({
			...agent,
			order: i + 1,
		}));
		setSelectedAgents(reorderedAgents);
		updateFormValue(reorderedAgents);
	};

	// 上移Agent
	const moveAgentUp = (index: number) => {
		if (index === 0) return;
		const newSelectedAgents = [...selectedAgents];
		[newSelectedAgents[index], newSelectedAgents[index - 1]] = [newSelectedAgents[index - 1], newSelectedAgents[index]];
		// 重新排序
		const reorderedAgents = newSelectedAgents.map((agent, i) => ({
			...agent,
			order: i + 1,
		}));
		setSelectedAgents(reorderedAgents);
		updateFormValue(reorderedAgents);
	};

	// 下移Agent
	const moveAgentDown = (index: number) => {
		if (index === selectedAgents.length - 1) return;
		const newSelectedAgents = [...selectedAgents];
		[newSelectedAgents[index], newSelectedAgents[index + 1]] = [newSelectedAgents[index + 1], newSelectedAgents[index]];
		// 重新排序
		const reorderedAgents = newSelectedAgents.map((agent, i) => ({
			...agent,
			order: i + 1,
		}));
		setSelectedAgents(reorderedAgents);
		updateFormValue(reorderedAgents);
	};

	// 更新Agent配置
	const updateAgentConfig = (index: number, field: keyof AgentConfig, value: string) => {
		const newSelectedAgents = [...selectedAgents];
		newSelectedAgents[index] = {
			...newSelectedAgents[index],
			[field]: value,
		};
		setSelectedAgents(newSelectedAgents);
		updateFormValue(newSelectedAgents);
	};

	// 更新表单值
	const updateFormValue = (agentConfigs: AgentConfig[]) => {
		form.setFieldsValue({
			agentConfigs: agentConfigs,
		});
	};

	// 获取可选的Agent（未被选中的）
	const availableAgents = agents.filter((agent) => !selectedAgents.find((selected) => selected.agentId === agent.id));

	return (
		<div>
			{/* 基本信息 */}
			<Card
				title={t("基本应用信息")}
				bordered={false}
				style={cardStyle}
				headStyle={cardHeadStyle}
				bodyStyle={cardBodyStyle}
			>
				<Row gutter={[24, 16]}>
					<Col span={12}>
						<Form.Item
							name="name"
							label={t("应用名称")}
							rules={[
								{ required: true, message: t("请输入应用名称") },
								{ min: 2, message: t("应用名称至少2个字符") },
								{ max: 50, message: t("应用名称不超过50个字符") },
							]}
						>
							<Input placeholder={t("请输入应用名称")} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="icon" label={t("应用图标")} rules={[{ type: "url", message: t("请输入有效的URL") }]}>
							<Input placeholder={t("请输入图标URL")} />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item
							name="description"
							label={t("应用描述")}
							rules={[{ max: 500, message: t("应用描述不超过500个字符") }]}
						>
							<TextArea rows={3} placeholder={t("请输入应用描述")} />
						</Form.Item>
					</Col>
				</Row>
			</Card>

			{/* Agent编排 */}
			<Card
				title={t("Agent编排")}
				bordered={false}
				style={cardStyle}
				headStyle={cardHeadStyle}
				bodyStyle={cardBodyStyle}
			>
				<Row gutter={[24, 16]}>
					<Col span={24}>
						<Form.Item label={t("添加Agent")} rules={[{ required: true, message: t("请至少选择一个Agent") }]}>
							<Select
								placeholder={t("请选择要添加的Agent")}
								onSelect={(value) => value && addAgent(value as string)}
								value={undefined}
								style={{ width: "100%" }}
							>
								{availableAgents.map((agent) => (
									<Select.Option key={agent.id} value={agent.id}>
										{agent.name}
									</Select.Option>
								))}
							</Select>
						</Form.Item>
					</Col>
				</Row>

				{selectedAgents.length > 0 && (
					<>
						<Divider>{t("已选择的Agent")}</Divider>
						<List
							dataSource={selectedAgents}
							renderItem={(agentConfig, index) => (
								<List.Item
									key={agentConfig.agentId}
									style={{
										padding: "16px",
										marginBottom: "8px",
										border: `1px solid ${token.colorBorderSecondary}`,
										borderRadius: "6px",
										backgroundColor: token.colorBgContainer,
									}}
								>
									<div style={{ width: "100%" }}>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "12px",
											}}
										>
											<Space>
												<Tag color="blue">#{agentConfig.order}</Tag>
												<Text strong>{agentConfig.agentName}</Text>
											</Space>
											<Space>
												<Button
													type="text"
													icon={<ArrowUpOutlined />}
													size="small"
													disabled={index === 0}
													onClick={() => moveAgentUp(index)}
												/>
												<Button
													type="text"
													icon={<ArrowDownOutlined />}
													size="small"
													disabled={index === selectedAgents.length - 1}
													onClick={() => moveAgentDown(index)}
												/>
												<Button
													type="text"
													icon={<DeleteOutlined />}
													size="small"
													danger
													onClick={() => removeAgent(index)}
												/>
											</Space>
										</div>
										<Row gutter={[16, 16]}>
											<Col span={24}>
												<Form.Item label={t("功能选择行为")} style={{ marginBottom: 0 }}>
													<Select
														value={agentConfig.functionChoiceBehavior}
														onChange={(value) => updateAgentConfig(index, "functionChoiceBehavior", value)}
													>
														{FUNCTION_CHOICE_BEHAVIORS.map((behavior) => (
															<Select.Option key={behavior.id} value={behavior.id}>
																{behavior.name}
															</Select.Option>
														))}
													</Select>
												</Form.Item>
											</Col>
										</Row>
									</div>
								</List.Item>
							)}
						/>
					</>
				)}

				<Form.Item name="agentConfigs" hidden>
					<Input />
				</Form.Item>
			</Card>

			{/* 应用级配置 */}
			<Card
				title={t("应用级配置")}
				bordered={false}
				style={cardStyle}
				styles={{ header: cardHeadStyle, body: cardBodyStyle }}
			>
				<Row gutter={[24, 16]}>
					<Col span={12}>
						<Form.Item
							name="AgentMode"
							label={t("Agent Model")}
							tooltip={t("控制Agent执行模式")}
							initialValue="773694F9-9C4D-928E-976C-0AB11C751373"
						>
							<Select style={{ width: "100%" }}>
								<Select.Option value="773694F9-9C4D-928E-976C-0AB11C751373">{t("Sequential")}</Select.Option>
								<Select.Option value="873694F1-7C2D-422E-876C-0AB11C751373">{t("GroupChat")}</Select.Option>
								<Select.Option value="333694F9-7C4D-422E-876C-0AB11C751999">{t("Magentic")}</Select.Option>
								<Select.Option value="976694F9-7C4D-422E-876C-0AB11C751373">{t("Handoff")}</Select.Option>
								<Select.Option value="673898F9-784D-482E-876C-0AB11C751373">{t("Concurrent")}</Select.Option>
							</Select>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="IsOutputAll"
							label={t("是否全量输出Agent执行过程结果")}
							tooltip={t("控制Agent是否输出Agent执行过程结果")}
							initialValue={false}
						>
							<Select style={{ width: "100%" }}>
								<Select.Option value={true}>{t("是")}</Select.Option>
								<Select.Option value={false}>{t("否")}</Select.Option>
							</Select>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="kernelFunctionTerminationStrategy"
							label={t("终止策略")}
							tooltip={t("用于定义Agent执行终止条件的策略，不填写则使用默认值")}
						>
							<TextArea
								rows={3}
								placeholder={t("请输入终止策略（可选，不填写则使用默认值）")}
								style={{ resize: "vertical" }}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="kernelFunctionSelectionStrategy"
							label={t("选择策略")}
							tooltip={t("用于定义Agent功能选择的策略，不填写则使用默认值")}
						>
							<TextArea
								rows={3}
								placeholder={t("请输入选择策略（可选，不填写则使用默认值）")}
								style={{ resize: "vertical" }}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="maximumIterations"
							label={t("最大迭代次数")}
							rules={[
								{ required: true, message: t("请输入最大迭代次数") },
								{ type: "number", min: 1, message: t("最大迭代次数至少为1") },
								{
									type: "number",
									max: 100,
									message: t("最大迭代次数不超过100"),
								},
							]}
							initialValue={10}
						>
							<InputNumber min={1} max={100} style={{ width: "100%" }} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="isInLine"
							label={t("是否按序执行")}
							tooltip={t("控制Agent是否按照配置的顺序依次执行")}
							initialValue={false}
						>
							<Select style={{ width: "100%" }}>
								<Select.Option value={true}>{t("是")}</Select.Option>
								<Select.Option value={false}>{t("否")}</Select.Option>
							</Select>
						</Form.Item>
					</Col>
				</Row>
			</Card>

			{/* 提示词配置 */}
			<Card
				title={t("提示词配置")}
				bordered={false}
				style={cardStyle}
				headStyle={cardHeadStyle}
				bodyStyle={cardBodyStyle}
			>
				<Row gutter={[24, 16]}>
					<Col span={24}>
						<Form.Item
							name="promptWord"
							label={t("提示词")}
							rules={[{ max: 2000, message: t("提示词不超过2000个字符") }]}
						>
							<TextArea rows={4} placeholder={t("请输入提示词")} autoSize={{ minRows: 3, maxRows: 6 }} />
						</Form.Item>
					</Col>
				</Row>
			</Card>
		</div>
	);
};

export default AgentApplicationForm;
