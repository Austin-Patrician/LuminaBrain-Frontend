import React from 'react';
import { Select } from 'antd';

const { OptGroup } = Select;

interface ModelOption {
  label: string;
  value: string;
  provider: string;
}

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: ModelOption[];
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange, options }) => {
  // 按提供商分组模型
  const groupedModels = options.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, ModelOption[]>);

  return (
    <Select
      value={value}
      onChange={onChange}
      style={{ minWidth: 180 }}
      placeholder="选择模型"
      optionLabelProp="label"
    >
      {Object.entries(groupedModels).map(([provider, models]) => (
        <OptGroup
          key={provider}
          label={
            <div style={{
              padding: '4px 0',
              fontWeight: 600,
              fontSize: '14px',
              color: '#374151'
            }}>
              {provider}
            </div>
          }
        >
          {models.map((model) => (
            <Select.Option
              key={model.value}
              value={model.value}
              label={model.label}
            >
              <div style={{
                padding: '2px 0',
                fontSize: '13px'
              }}>
                <span>{model.label}</span>
              </div>
            </Select.Option>
          ))}
        </OptGroup>
      ))}
    </Select>
  );
};

export default ModelSelector;