import React from 'react';
import { Card, Button, message } from 'antd';
import ModelSelector from '../pages/Chat/components/ModelSelector';
import { aimodelService } from '../api/services/aimodelService';

const TestModelSelector: React.FC = () => {
  const [selectedValue, setSelectedValue] = React.useState<string>('');

  const testDirectApi = async () => {
    try {
      const response = await aimodelService.getAiModelsAndKnowledges();
      console.log('API Response:', response);
      message.success('API调用成功，请查看控制台');
    } catch (error) {
      console.error('API Error:', error);
      message.error('API调用失败');
    }
  };

  const handleModelChange = (modelId: string, modelType?: string) => {
    setSelectedValue(modelId);
    console.log('Selected Model:', { modelId, modelType });
  };

  return (
    <Card title="模型选择器测试" style={{ margin: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={testDirectApi} type="primary">
          测试直接API调用
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4>模型选择器：</h4>
        <ModelSelector
          value={selectedValue}
          onChange={handleModelChange}
        />
        <p>当前选择的值: {selectedValue}</p>
      </div>
    </Card>
  );
};

export default TestModelSelector;
