import React from "react";
import { Modal, Descriptions, Tag } from "antd";
import type { Agent } from "#/entity";

// 函数选择行为选项
const FUNCTION_CHOICE_BEHAVIORS = [
  { id: "7DB033D5-C0C4-4139-9522-24AC58A202AB", name: "自动" },
  { id: "A665F2CB-4A80-4E79-8A42-D7E612F2A1EC", name: "必需" },
  { id: "4FFBB956-E037-4D42-8F19-626627911983", name: "无" },
];

// 状态选项
const STATUS_TYPES = [
  { id: "DE546396-5B62-41E5-8814-4C072C74F26A", name: "活跃" },
  { id: "57B7ADD1-2A86-4BFF-8A22-2324658D604A", name: "非活跃" },
];

interface ViewAgentModalProps {
  visible: boolean;
  agent: Agent | null;
  onCancel: () => void;
  serviceOptions: { aiModelId: string; aiModelName: string }[]; // 服务选项
}

const ViewAgentModal: React.FC<ViewAgentModalProps> = ({
  visible,
  agent,
  onCancel,
  serviceOptions,
}) => {
  if (!agent) return null;

  const getServiceName = (serviceId: string) => {
    const service = serviceOptions.find((s: { aiModelId: string; aiModelName: string }) => s.aiModelId === serviceId);
    return service ? service.aiModelName : "未知";
  };

  const getFunctionBehaviorName = (id: string) => {
    const behavior = FUNCTION_CHOICE_BEHAVIORS.find((b: { id: string; name: string }) => b.id === id);
    return behavior ? behavior.name : "未知";
  };

  const getStatusName = (id: string) => {
    const status = STATUS_TYPES.find((s: { id: string; name: string }) => s.id === id);
    return status ? status.name : "未知";
  };

  return (
    <Modal
      title="查看 Agent 详情"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="名称">{agent.name}</Descriptions.Item>
        <Descriptions.Item label="指令说明">{agent.instructions ?? "无"}</Descriptions.Item>
        <Descriptions.Item label="服务">{agent.serviceName}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={agent.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "success" : "error"}>
            {getStatusName(agent.statusId)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="函数选择行为">{getFunctionBehaviorName(agent.functionChoiceBehaviorId)}</Descriptions.Item>
        <Descriptions.Item label="扩展数据">{agent.extensionData}</Descriptions.Item>
        <Descriptions.Item label="Temperature">{agent.temperature}</Descriptions.Item>
        <Descriptions.Item label="Top P">{agent.topP}</Descriptions.Item>
        <Descriptions.Item label="频率惩罚">{agent.frequencyPenalty}</Descriptions.Item>
        <Descriptions.Item label="存在惩罚">{agent.presencePenalty}</Descriptions.Item>
        <Descriptions.Item label="最大令牌数">{agent.maxTokens}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{agent.createdAt ? new Date(agent.createdAt).toLocaleString() : "未知"}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewAgentModal;