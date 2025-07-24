import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Select,
  Switch,
  Modal,
  Tag,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Avatar,
  Pagination,
  Spin,
  Badge,
  Tooltip,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CloseOutlined,
  AppstoreOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
  UserOutlined,
  TagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import './index.css';
import { useUserPermission } from "@/store/userStore";

const { Option } = Select;

// Mock data interface
interface Application {
  id: string;
  name: string;
  icon: string;
  categories: string[];
  status: 'waiting' | 'checking' | 'approved' | 'rejected';
  submissionTime: string;
  description: string;
  author: string;
  version: string;
}


// Mock data
const mockApplications: Application[] = [
  {
    id: '1',
    name: 'Task Manager Pro',
    icon: 'https://via.placeholder.com/40x40/4A90E2/FFFFFF?text=TM',
    categories: ['Utility', 'Productivity'],
    status: 'waiting',
    submissionTime: '2024-01-15 10:30:00',
    description: 'A comprehensive task management application with advanced features for team collaboration and project tracking.',
    author: 'John Doe',
    version: '1.2.0',
  },
  {
    id: '2',
    name: 'Photo Editor Plus',
    icon: 'https://via.placeholder.com/40x40/2ECC71/FFFFFF?text=PE',
    categories: ['Graphics', 'Creative', 'Media'],
    status: 'checking',
    submissionTime: '2024-01-14 15:45:00',
    description: 'Professional photo editing software with AI-powered enhancement tools and cloud synchronization.',
    author: 'Jane Smith',
    version: '2.1.5',
  },
  {
    id: '3',
    name: 'Code Snippet Manager',
    icon: 'https://via.placeholder.com/40x40/9B59B6/FFFFFF?text=CS',
    categories: ['Developer Tools'],
    status: 'approved',
    submissionTime: '2024-01-13 09:15:00',
    description: 'Organize and manage your code snippets with syntax highlighting and search functionality.',
    author: 'Mike Johnson',
    version: '1.0.3',
  },
  {
    id: '4',
    name: 'Fitness Tracker',
    icon: 'https://via.placeholder.com/40x40/E74C3C/FFFFFF?text=FT',
    categories: ['Health', 'Lifestyle'],
    status: 'waiting',
    submissionTime: '2024-01-12 14:20:00',
    description: 'Track your fitness goals, workouts, and health metrics with detailed analytics and progress reports.',
    author: 'Sarah Wilson',
    version: '3.0.1',
  },
  {
    id: '5',
    name: 'Music Player X',
    icon: 'https://via.placeholder.com/40x40/F39C12/FFFFFF?text=MP',
    categories: ['Entertainment', 'Media'],
    status: 'approved',
    submissionTime: '2024-01-11 11:00:00',
    description: 'High-quality music player with equalizer, playlist management, and streaming capabilities.',
    author: 'David Brown',
    version: '2.5.0',
  },
];

const ApplicationReviewPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>(mockApplications);
  const [loading, setLoading] = useState(false);


  // Check if user has admin permission
  const checkAdminPermission = () => {
    try {
      const permissions = useUserPermission();

      console.log(permissions);
      return permissions?.some(p => p.id === '3981225257359247');
    } catch {
      return false;
    }
  };

  const [isAdmin] = useState(checkAdminPermission());
  const [viewMode, setViewMode] = useState<'my' | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [previewModal, setPreviewModal] = useState<{
    visible: boolean;
    application: Application | null;
  }>({ visible: false, application: null });

  // Category color mapping
  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'Utility': '#4A90E2',
      'Productivity': '#4A90E2',
      'Graphics': '#2ECC71',
      'Creative': '#2ECC71',
      'Media': '#2ECC71',
      'Developer Tools': '#9B59B6',
      'Health': '#E74C3C',
      'Lifestyle': '#E74C3C',
      'Entertainment': '#F39C12',
      'Game': '#2ECC71',
    };
    return colorMap[category] || '#666666';
  };

  // Status color mapping
  const getStatusColor = (status: string): string => {
    const colorMap: { [key: string]: string } = {
      'waiting': '#F39C12',
      'checking': '#4A90E2',
      'approved': '#2ECC71',
      'rejected': '#E74C3C',
    };
    return colorMap[status] || '#666666';
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = [...applications];

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.submissionTime).getTime();
      const dateB = new Date(b.submissionTime).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredApplications(filtered);
  }, [applications, searchText, statusFilter, sortOrder]);

  // Handle preview
  const handlePreview = (application: Application) => {
    setPreviewModal({ visible: true, application });
  };

  // Handle modal close
  const handleModalClose = () => {
    setPreviewModal({ visible: false, application: null });
  };

  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleOutlined className="status-approved" />;
      case 'waiting':
        return <ClockCircleOutlined className="status-waiting" />;
      case 'checking':
        return <ExclamationCircleOutlined className="status-checking" />;
      case 'rejected':
        return <StopOutlined className="status-rejected" />;
      default:
        return <ClockCircleOutlined className="status-waiting" />;
    }
  };

  // Pagination data
  const paginatedData = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="modern-application-review">
      {/* Modern Header */}
      <div className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <AppstoreOutlined />
            </div>
            <div className="header-text">
              <h1>应用审核中心</h1>
              <p>管理和审核应用程序的发布流程</p>
            </div>
          </div>
          {isAdmin && (
            <div className="header-right">
              <div className="view-toggle">
                <span className="toggle-label">视图模式</span>
                <Switch
                  checked={viewMode === 'all'}
                  onChange={(checked) => setViewMode(checked ? 'all' : 'my')}
                  checkedChildren="全部"
                  unCheckedChildren="我的"
                  size="default"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="modern-filter-bar">
        <div className="filter-section">
          <div className="filter-item">
            <label className="filter-label">
              <FilterOutlined />
              状态筛选
            </label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="modern-select"
              placeholder="选择状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="waiting">等待审核</Option>
              <Option value="checking">审核中</Option>
              <Option value="approved">已通过</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
          </div>
          <div className="filter-item">
            <label className="filter-label">
              <SortAscendingOutlined />
              时间排序
            </label>
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              className="modern-select"
              placeholder="排序方式"
            >
              <Option value="desc">最新优先</Option>
              <Option value="asc">最早优先</Option>
            </Select>
          </div>
          <div className="filter-item search-item">
            <label className="filter-label">
              <SearchOutlined />
              搜索应用
            </label>
            <Input
              placeholder="输入应用名称搜索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="modern-search"
              prefix={<SearchOutlined />}
              allowClear
            />
          </div>
        </div>
      </div>

      {/* Modern Content Grid */}
      <div className="modern-content">
        <Spin spinning={loading}>
          <div className="applications-grid">
            {paginatedData.map((app) => (
              <div key={app.id} className="app-card">
                <div className="app-card-header">
                  <div className="app-icon-wrapper">
                    <Avatar
                      src={app.icon}
                      size={56}
                      shape="square"
                      className="app-icon"
                    />
                    <div className="status-indicator">
                      {app.status === 'approved' && <CheckCircleOutlined className="status-approved" />}
                      {app.status === 'waiting' && <ClockCircleOutlined className="status-waiting" />}
                      {app.status === 'checking' && <ExclamationCircleOutlined className="status-checking" />}
                      {app.status === 'rejected' && <StopOutlined className="status-rejected" />}
                    </div>
                  </div>
                  <div className="app-info">
                    <h3 className="app-name">{app.name}</h3>
                    <div className="app-meta">
                      <span className="app-author">
                        <UserOutlined /> {app.author}
                      </span>
                      <span className="app-version">v{app.version}</span>
                    </div>
                  </div>
                </div>

                <div className="app-card-body">
                  <div className="app-categories">
                    {app.categories.slice(0, 2).map(category => (
                      <Tag
                        key={category}
                        className="category-tag"
                        style={{ backgroundColor: getCategoryColor(category) }}
                      >
                        {category}
                      </Tag>
                    ))}
                    {app.categories.length > 2 && (
                      <Tag className="more-tag">+{app.categories.length - 2}</Tag>
                    )}
                  </div>

                  <p className="app-description">{app.description}</p>

                  <div className="app-footer">
                    <div className="app-time">
                      <CalendarOutlined />
                      <span>{new Date(app.submissionTime).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(app)}
                      className="preview-btn"
                      size="small"
                    >
                      预览
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modern Pagination */}
          <div className="modern-pagination">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredApplications.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `显示 ${range[0]}-${range[1]} 条，共 ${total} 个应用`
              }
            />
          </div>
        </Spin>
      </div>

      {/* Modern Preview Modal */}
      <Modal
        title={null}
        open={previewModal.visible}
        onCancel={handleModalClose}
        footer={null}
        width={680}
        className="modern-preview-modal"
        closeIcon={<CloseOutlined className="modal-close-icon" />}
      >
        {previewModal.application && (
          <div className="modern-preview-content">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="app-preview-icon">
                <Avatar
                  src={previewModal.application.icon}
                  size={80}
                  shape="square"
                  className="preview-avatar"
                />
                <div className="status-badge">
                  {previewModal.application.status === 'approved' && (
                    <Badge status="success" text="已通过" />
                  )}
                  {previewModal.application.status === 'waiting' && (
                    <Badge status="warning" text="等待审核" />
                  )}
                  {previewModal.application.status === 'checking' && (
                    <Badge status="processing" text="审核中" />
                  )}
                  {previewModal.application.status === 'rejected' && (
                    <Badge status="error" text="已拒绝" />
                  )}
                </div>
              </div>
              <div className="app-preview-info">
                <h2 className="preview-title">{previewModal.application.name}</h2>
                <div className="preview-meta">
                  <span className="version-info">版本 {previewModal.application.version}</span>
                  <Divider type="vertical" />
                  <span className="author-info">
                    <UserOutlined /> {previewModal.application.author}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="info-section">
                <h4 className="section-title">
                  <TagOutlined /> 应用分类
                </h4>
                <div className="categories-preview">
                  {previewModal.application.categories.map(category => (
                    <Tag
                      key={category}
                      className="preview-category-tag"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    >
                      {category}
                    </Tag>
                  ))}
                </div>
              </div>

              <div className="info-section">
                <h4 className="section-title">应用描述</h4>
                <p className="preview-description">
                  {previewModal.application.description}
                </p>
              </div>

              <div className="info-section">
                <h4 className="section-title">
                  <CalendarOutlined /> 提交时间
                </h4>
                <p className="submission-time">
                  {new Date(previewModal.application.submissionTime).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationReviewPage;