import React from "react";
import { Slider } from "antd";

interface NodeData {
  label?: string;
  model?: string;
  temperature?: number;
  topP?: number;
  [key: string]: any;
}

interface Node {
  id: string;
  type: string;
  data: NodeData;
}

interface PropertiesPanelProps {
  node: Node | null;
  onChange: (id: string, data: Partial<NodeData>) => void;
}

function PropertiesPanel({ node, onChange }: PropertiesPanelProps) {
  if (!node) {
    return <div className="properties-panel-title">请选择一个节点</div>;
  }

  // AI相关节点类型
  const aiTypes = ["aiDialogNode", "aiSummaryNode", "aiExtractNode", "aiJsonNode"];

  // 处理表单变更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(node.id, { [name]: value });
  };

  const handleSliderChange = (name: string, value: number) => {
    onChange(node.id, { [name]: value });
  };

  return (
    <div>
      <div className="properties-panel-title">属性面板</div>
      <form className="properties-panel-form">
        <label>名称</label>
        <input
          name="label"
          value={node.data.label || ""}
          onChange={handleInputChange}
          placeholder="节点名称"
        />
        {/* AI相关节点参数设置 */}
        {aiTypes.includes(node.type) && (
          <>
            <label>AI模型</label>
            <select
              name="model"
              value={node.data.model || ""}
              onChange={handleInputChange}
            >
              <option value="">请选择模型</option>
              <option value="gpt-3.5">GPT-3.5</option>
              <option value="gpt-4">GPT-4</option>
              <option value="qwen">Qwen</option>
            </select>
            <label>温度 (temperature)</label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={node.data.temperature || 0.7}
              onChange={(v) => handleSliderChange("temperature", v)}
            />
            <label>TopP</label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={node.data.topP || 0.8}
              onChange={(v) => handleSliderChange("topP", v)}
            />
          </>
        )}
        {/* 其他类型节点可扩展更多参数 */}
      </form>
    </div>
  );
}

export default PropertiesPanel;
