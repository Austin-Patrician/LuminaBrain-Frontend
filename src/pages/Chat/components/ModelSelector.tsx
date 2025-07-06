import React, { useEffect, useState } from 'react';
import { Select, message as antdMessage } from 'antd';
import { aimodelService } from '@/api/services/aimodelService';
import type { AiModelAndKnowledgeItem } from '#/entity';

const { OptGroup } = Select;

interface ModelSelectorProps {
  value: string;
  onChange: (value: string, type?: string, isStream?: boolean) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange
}) => {
  const [apiOptions, setApiOptions] = useState<AiModelAndKnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 组件加载时获取数据
  useEffect(() => {
    fetchAiModelsAndKnowledges();
  }, []);

  const fetchAiModelsAndKnowledges = async () => {
    setLoading(true);
    try {
      const response = await aimodelService.getAiModelsAndKnowledges();

      setApiOptions(response);

    } catch (error) {
      console.error('Failed to fetch AI models and knowledges:', error);
      antdMessage.error('获取模型和知识库列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理选择变化，找到对应的类型信息
  const handleChange = (selectedValue: string) => {
    const selectedItem = apiOptions.find(item => item.id === selectedValue);
    onChange(selectedValue, selectedItem?.type, selectedItem?.isStream);
  };

  // 按类型分组（新API数据）
  const groupedByType = apiOptions.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, AiModelAndKnowledgeItem[]>);

  return (
    <Select
      value={value}
      onChange={handleChange}
      style={{ minWidth: 180 }}
      placeholder="选择模型或知识库"
      optionLabelProp="label"
      loading={loading}
    >
      {Object.entries(groupedByType).map(([type, items]) => (
        <OptGroup
          key={type}
          label={
            <div style={{
              padding: '4px 0',
              fontWeight: 600,
              fontSize: '14px',
              color: '#374151'
            }}>
              {type === 'AI Model' ? 'AI 模型' : '知识库'}
            </div>
          }
        >
          {items.map((item) => (
            <Select.Option
              key={item.id}
              value={item.id}
              label={item.label}
            >
              <div style={{
                padding: '2px 0',
                fontSize: '13px'
              }}>
                <span>{item.label}</span>
              </div>
            </Select.Option>
          ))}
        </OptGroup>
      ))}
    </Select>
  );
};

export default ModelSelector;