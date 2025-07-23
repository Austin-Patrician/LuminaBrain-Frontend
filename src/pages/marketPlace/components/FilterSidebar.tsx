import {
  Card,
  Checkbox,
  Rate,
  Slider,
  DatePicker,
  Input,
  Space,
  Typography,
  Divider,
  Tag,
  Button,
  Collapse,
} from "antd";
import {
  FilterOutlined,
  TagOutlined,
  UserOutlined,
  CalendarOutlined,
  StarOutlined,
  ClearOutlined,
} from "@ant-design/icons";

import type { MarketplaceItemType, FilterState, Category, Tag as TagType } from "../types/marketplace";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface FilterSidebarProps {
  visible: boolean;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories?: Category[];
  tags?: TagType[];
  onClear: () => void;
  loading?: boolean;
}

// 类型选项
const TYPE_OPTIONS: Array<{ label: string; value: MarketplaceItemType }> = [
  { label: "AI Agent", value: "agent" },
  { label: "提示词", value: "prompt" },
  { label: "应用", value: "application" },
];

export default function FilterSidebar({
  visible,
  filters,
  onFiltersChange,
  categories = [],
  tags = [],
  onClear,
  loading = false,
}: FilterSidebarProps) {
  if (!visible) return null;

  const handleTypeChange = (types: MarketplaceItemType[]) => {
    onFiltersChange({ ...filters, types });
  };

  const handleCategoryChange = (categories: string[]) => {
    onFiltersChange({ ...filters, categories });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleRatingChange = (range: number | number[]) => {
    if (Array.isArray(range) && range.length === 2) {
      onFiltersChange({ ...filters, ratingRange: [range[0], range[1]] });
    }
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    onFiltersChange({
      ...filters,
      dateRange: dateStrings[0] && dateStrings[1] ? dateStrings : undefined
    });
  };

  const handleAuthorAdd = (author: string) => {
    if (author && !filters.authors.includes(author)) {
      onFiltersChange({ ...filters, authors: [...filters.authors, author] });
    }
  };

  const handleAuthorRemove = (author: string) => {
    onFiltersChange({
      ...filters,
      authors: filters.authors.filter(a => a !== author)
    });
  };

  // 计算活跃筛选器数量
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.types.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.ratingRange[0] > 0 || filters.ratingRange[1] < 5) count++;
    if (filters.dateRange) count++;
    if (filters.authors.length > 0) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <Card
      className="h-fit sticky top-4"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FilterOutlined />
            <span>筛选器</span>
            {activeCount > 0 && (
              <Tag color="blue" className="ml-2">
                {activeCount}
              </Tag>
            )}
          </div>
          <Button
            type="text"
            size="small"
            icon={<ClearOutlined />}
            onClick={onClear}
            disabled={activeCount === 0}
          >
            清除
          </Button>
        </div>
      }
      loading={loading}
    >
      <Collapse defaultActiveKey={["type", "category", "rating"]} ghost>
        {/* 内容类型 */}
        <Panel
          header={
            <div className="flex items-center space-x-2">
              <span>内容类型</span>
              {filters.types.length > 0 && (
                <Tag color="blue">{filters.types.length}</Tag>
              )}
            </div>
          }
          key="type"
        >
          <Checkbox.Group
            options={TYPE_OPTIONS}
            value={filters.types}
            onChange={handleTypeChange}
            className="flex flex-col space-y-2"
          />
        </Panel>

        {/* 分类 */}
        <Panel
          header={
            <div className="flex items-center space-x-2">
              <span>分类</span>
              {filters.categories.length > 0 && (
                <Tag color="green">{filters.categories.length}</Tag>
              )}
            </div>
          }
          key="category"
        >
          <Checkbox.Group
            value={filters.categories}
            onChange={handleCategoryChange}
            className="flex flex-col space-y-2"
          >
            {categories.map(category => (
              <Checkbox key={category.id} value={category.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{category.name}</span>
                  {category.count !== undefined && (
                    <Text type="secondary" className="text-xs">
                      ({category.count})
                    </Text>
                  )}
                </div>
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Panel>

        {/* 评分 */}
        <Panel
          header={
            <div className="flex items-center space-x-2">
              <StarOutlined />
              <span>评分</span>
            </div>
          }
          key="rating"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Rate disabled value={filters.ratingRange[0]} />
              <span>-</span>
              <Rate disabled value={filters.ratingRange[1]} />
            </div>
            <Slider
              range
              min={0}
              max={5}
              step={0.5}
              value={filters.ratingRange}
              onChange={handleRatingChange}
              marks={{
                0: "0",
                2.5: "2.5",
                5: "5",
              }}
            />
          </div>
        </Panel>

        {/* 热门标签 */}
        <Panel
          header={
            <div className="flex items-center space-x-2">
              <TagOutlined />
              <span>热门标签</span>
              {filters.tags.length > 0 && (
                <Tag color="purple">{filters.tags.length}</Tag>
              )}
            </div>
          }
          key="tags"
        >
          <div className="space-y-3">
            <Space size={[4, 8]} wrap>
              {tags.slice(0, 20).map(tag => (
                <Tag
                  key={tag.name}
                  color={filters.tags.includes(tag.name) ? "blue" : "default"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag.name)}
                >
                  #{tag.name}
                  <Text type="secondary" className="ml-1">
                    ({tag.count})
                  </Text>
                </Tag>
              ))}
            </Space>
            {filters.tags.length > 0 && (
              <div>
                <Divider />
                <Text type="secondary" className="text-xs">已选择的标签:</Text>
                <div className="mt-2">
                  <Space size={[4, 4]} wrap>
                    {filters.tags.map(tag => (
                      <Tag
                        key={tag}
                        color="blue"
                        closable
                        onClose={() => handleTagToggle(tag)}
                      >
                        #{tag}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </div>
            )}
          </div>
        </Panel>

        {/* 发布时间 */}
        <Panel
          header={
            <div className="flex items-center space-x-2">
              <CalendarOutlined />
              <span>发布时间</span>
            </div>
          }
          key="date"
        >
          <RangePicker
            className="w-full"
            onChange={handleDateRangeChange}
            placeholder={["开始日期", "结束日期"]}
          />
        </Panel>

        {/* 作者筛选 */}
        <Panel
          header={
            <div className="flex items-center space-x-2">
              <UserOutlined />
              <span>作者</span>
              {filters.authors.length > 0 && (
                <Tag color="orange">{filters.authors.length}</Tag>
              )}
            </div>
          }
          key="author"
        >
          <div className="space-y-3">
            <Input.Search
              placeholder="搜索作者..."
              onSearch={handleAuthorAdd}
              enterButton="添加"
            />
            {filters.authors.length > 0 && (
              <div>
                <Text type="secondary" className="text-xs">已选择的作者:</Text>
                <div className="mt-2">
                  <Space size={[4, 4]} wrap>
                    {filters.authors.map(author => (
                      <Tag
                        key={author}
                        color="orange"
                        closable
                        onClose={() => handleAuthorRemove(author)}
                      >
                        @{author}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </Collapse>
    </Card>
  );
}
