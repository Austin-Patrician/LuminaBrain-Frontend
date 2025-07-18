import React from "react";
import { Card, Button, Space, Typography } from "antd";
import { FunctionOutlined, ExperimentOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface OptimizationTypeSelectorProps {
  onSelect: (type: "function-calling" | "prompt-optimization") => void;
  disabled?: boolean;
}

const OptimizationTypeSelector: React.FC<OptimizationTypeSelectorProps> = ({
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Function Calling 优化 */}
      <Card
        hoverable={!disabled}
        className={`border-2 transition-all cursor-pointer ${
          disabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-blue-200 hover:border-blue-400 hover:shadow-md"
        }`}
        onClick={() => !disabled && onSelect("function-calling")}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-3 rounded-lg ${
              disabled ? "bg-gray-200" : "bg-blue-100"
            }`}
          >
            <FunctionOutlined
              className={`text-xl ${
                disabled ? "text-gray-400" : "text-blue-600"
              }`}
            />
          </div>
          <div className="flex-1">
            <h4
              className={`font-semibold mb-1 ${
                disabled ? "text-gray-400" : "text-gray-800"
              }`}
            >
              Function Calling 优化
            </h4>
            <Text
              type={disabled ? undefined : "secondary"}
              className={disabled ? "text-gray-400" : "text-gray-600"}
            >
              优化函数调用相关的提示词，提升AI工具使用的准确性和效率
            </Text>
          </div>
        </div>
      </Card>

      {/* 通用提示词优化 */}
      <Card
        hoverable={!disabled}
        className={`border-2 transition-all cursor-pointer ${
          disabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-green-200 hover:border-green-400 hover:shadow-md"
        }`}
        onClick={() => !disabled && onSelect("prompt-optimization")}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-3 rounded-lg ${
              disabled ? "bg-gray-200" : "bg-green-100"
            }`}
          >
            <ExperimentOutlined
              className={`text-xl ${
                disabled ? "text-gray-400" : "text-green-600"
              }`}
            />
          </div>
          <div className="flex-1">
            <h4
              className={`font-semibold mb-1 ${
                disabled ? "text-gray-400" : "text-gray-800"
              }`}
            >
              通用提示词优化
            </h4>
            <Text
              type={disabled ? undefined : "secondary"}
              className={disabled ? "text-gray-400" : "text-gray-600"}
            >
              全面优化提示词结构、逻辑和表达，提升AI理解和响应质量
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OptimizationTypeSelector;
