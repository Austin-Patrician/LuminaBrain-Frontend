import { useState } from "react";
import { Tabs, type TabsProps } from "antd";
import { Iconify } from "@/components/icon";
import DictionaryTab from "./components/DictionaryTab";
import DictionaryItemTab from "./components/DictionaryItemTab";

export default function DictionaryManagePage() {
  const [activeTab, setActiveTab] = useState("dictionary");
  const [selectedDictionaryIds, setSelectedDictionaryIds] = useState<string[]>(
    []
  ); // 修改为数组类型

  const handleDictionarySelect = (dictionaryId: string) => {
    setSelectedDictionaryIds([dictionaryId]); // 单选时转换为数组
    setActiveTab("dictionaryItem");
  };

  const items: TabsProps["items"] = [
    {
      key: "dictionary",
      label: (
        <div className="flex items-center">
          <Iconify
            icon="solar:book-bookmark-bold-duotone"
            size={20}
            className="mr-2"
          />
          <span>字典管理</span>
        </div>
      ),
      children: <DictionaryTab onDictionarySelect={handleDictionarySelect} />,
    },
    {
      key: "dictionaryItem",
      label: (
        <div className="flex items-center">
          <Iconify
            icon="solar:list-arrow-down-bold-duotone"
            size={20}
            className="mr-2"
          />
          <span>字典项管理</span>
        </div>
      ),
      children: (
        <DictionaryItemTab selectedDictionaryIds={selectedDictionaryIds} />
      ), // 传递数组
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">数据字典管理</h1>
        <p className="text-gray-600 mt-1">管理系统中的字典和字典项数据</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        type="card"
        size="large"
        className="dictionary-tabs"
      />
    </div>
  );
}
