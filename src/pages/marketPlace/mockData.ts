import type { MarketplaceItem, Category, Tag, MarketplaceListResponse } from "./types/marketplace";

// Mock Categories
export const mockCategories: Category[] = [
  { id: "productivity", name: "效率工具", count: 25 },
  { id: "creativity", name: "创意助手", count: 18 },
  { id: "business", name: "商业分析", count: 15 },
  { id: "education", name: "教育培训", count: 12 },
  { id: "development", name: "开发工具", count: 20 },
  { id: "customer-service", name: "客户服务", count: 8 },
];

// Mock Tags
export const mockTags: Tag[] = [
  { name: "GPT-4", count: 45 },
  { name: "效率", count: 38 },
  { name: "创意", count: 32 },
  { name: "分析", count: 28 },
  { name: "客服", count: 25 },
  { name: "写作", count: 22 },
  { name: "翻译", count: 20 },
  { name: "编程", count: 18 },
  { name: "营销", count: 15 },
  { name: "教育", count: 12 },
  { name: "数据", count: 10 },
  { name: "设计", count: 8 },
];

// Mock Marketplace Items
export const mockMarketplaceItems: MarketplaceItem[] = [
  {
    id: "1",
    title: "智能客服助手",
    description: "专业的AI客服助手，能够智能回复客户问题，提升客户满意度。支持多轮对话、情感分析和问题分类。",
    type: "agent",
    category: "customer-service",
    tags: ["客服", "GPT-4", "效率"],
    content: {
      instructions: "你是一个专业的客服助手，请礼貌地回答客户的问题...",
      serviceId: "gpt-4",
      serviceName: "GPT-4",
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2000,
    },
    authorId: "user1",
    authorName: "张三",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T15:45:00Z",
    version: "1.2.0",
    likes: 128,
    downloads: 256,
    views: 1024,
    rating: 4.5,
    ratingCount: 32,
    status: "active",
    isPublic: true,
    isFeatured: true,
  },
  {
    id: "2",
    title: "文案创作专家",
    description: "专业的文案创作助手，能够根据品牌调性和目标受众生成高质量的营销文案、产品描述等内容。",
    type: "prompt",
    category: "creativity",
    tags: ["创意", "写作", "营销"],
    content: {
      systemPrompt: "你是一位资深的文案创作专家...",
      userPrompt: "请为我创作一份产品文案，要求：{requirements}",
      optimizationType: "prompt-optimization",
      modelRecommendations: ["gpt-4", "claude-3"],
      enableDeepReasoning: true,
    },
    authorId: "user2",
    authorName: "李四",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    createdAt: "2024-01-10T08:20:00Z",
    updatedAt: "2024-01-18T12:30:00Z",
    version: "2.1.0",
    likes: 89,
    downloads: 178,
    views: 756,
    rating: 4.3,
    ratingCount: 28,
    status: "active",
    isPublic: true,
    isFeatured: false,
  },
  {
    id: "3",
    title: "数据分析应用",
    description: "强大的数据分析工具，支持CSV文件导入，自动生成图表和洞察报告，适合业务分析师使用。",
    type: "application",
    category: "business",
    tags: ["分析", "数据", "效率"],
    content: {
      applicationTypeId: "data-analysis",
      applicationTypeName: "数据分析",
      chatModelId: "gpt-4",
      chatModelName: "GPT-4",
      promptWord: "数据分析助手",
      description: "专业的数据分析工具",
      temperature: 0.3,
      topP: 0.8,
      maxResponseTokens: 3000,
      maxRequestTokens: 1000,
    },
    authorId: "user3",
    authorName: "王五",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
    createdAt: "2024-01-05T14:15:00Z",
    updatedAt: "2024-01-22T09:45:00Z",
    version: "1.0.3",
    likes: 156,
    downloads: 312,
    views: 892,
    rating: 4.7,
    ratingCount: 45,
    status: "active",
    isPublic: true,
    isFeatured: true,
  },
  {
    id: "4",
    title: "英语学习伴侣",
    description: "个人化的英语学习助手，支持口语练习、语法纠错、词汇扩展等功能，让英语学习更有趣。",
    type: "agent",
    category: "education",
    tags: ["教育", "英语", "GPT-4"],
    content: {
      instructions: "你是一位专业的英语老师，帮助学生提升英语水平...",
      serviceId: "gpt-4",
      serviceName: "GPT-4",
      temperature: 0.8,
      topP: 0.9,
      maxTokens: 1500,
    },
    authorId: "user4",
    authorName: "赵六",
    createdAt: "2024-01-08T16:00:00Z",
    updatedAt: "2024-01-19T11:20:00Z",
    version: "1.1.2",
    likes: 67,
    downloads: 134,
    views: 523,
    rating: 4.2,
    ratingCount: 19,
    status: "active",
    isPublic: true,
    isFeatured: false,
  },
  {
    id: "5",
    title: "代码审查助手",
    description: "专业的代码审查工具，能够发现代码中的潜在问题、提供优化建议和最佳实践指导。",
    type: "prompt",
    category: "development",
    tags: ["编程", "效率", "GPT-4"],
    content: {
      systemPrompt: "你是一位资深的软件工程师和代码审查专家...",
      userPrompt: "请审查以下代码并提供改进建议：\n\n{code}",
      optimizationType: "function-calling",
      modelRecommendations: ["gpt-4", "claude-3"],
    },
    authorId: "user5",
    authorName: "孙七",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user5",
    createdAt: "2024-01-12T13:45:00Z",
    updatedAt: "2024-01-21T10:15:00Z",
    version: "1.3.1",
    likes: 94,
    downloads: 201,
    views: 678,
    rating: 4.6,
    ratingCount: 35,
    status: "active",
    isPublic: true,
    isFeatured: false,
  },
  {
    id: "6",
    title: "SEO优化工具",
    description: "专业的SEO优化助手，帮助优化网页内容、生成meta标签、关键词分析等，提升搜索引擎排名。",
    type: "application",
    category: "business",
    tags: ["营销", "SEO", "效率"],
    content: {
      applicationTypeId: "seo-tool",
      applicationTypeName: "SEO工具",
      chatModelId: "gpt-4",
      chatModelName: "GPT-4",
      promptWord: "SEO优化专家",
      temperature: 0.5,
      topP: 0.8,
      maxResponseTokens: 2000,
    },
    authorId: "user6",
    authorName: "周八",
    createdAt: "2024-01-14T09:30:00Z",
    updatedAt: "2024-01-23T14:20:00Z",
    version: "2.0.0",
    likes: 112,
    downloads: 245,
    views: 834,
    rating: 4.4,
    ratingCount: 41,
    status: "active",
    isPublic: true,
    isFeatured: true,
  },
  {
    id: "7",
    title: "创意logo设计师",
    description: "AI驱动的logo设计助手，能够根据品牌特色和行业特点生成创意logo概念和设计建议。",
    type: "prompt",
    category: "creativity",
    tags: ["设计", "创意", "品牌"],
    content: {
      systemPrompt: "你是一位专业的logo设计师和品牌专家...",
      userPrompt: "请为以下品牌设计logo概念：\n品牌名称：{brand_name}\n行业：{industry}\n风格偏好：{style}",
      optimizationType: "prompt-optimization",
      modelRecommendations: ["gpt-4", "claude-3"],
    },
    authorId: "user7",
    authorName: "吴九",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user7",
    createdAt: "2024-01-09T11:15:00Z",
    updatedAt: "2024-01-20T16:40:00Z",
    version: "1.2.3",
    likes: 73,
    downloads: 156,
    views: 467,
    rating: 4.1,
    ratingCount: 22,
    status: "active",
    isPublic: true,
    isFeatured: false,
  },
  {
    id: "8",
    title: "财务报表分析器",
    description: "专业的财务分析工具，能够解读财务报表、计算关键指标、提供投资建议和风险评估。",
    type: "agent",
    category: "business",
    tags: ["分析", "财务", "投资"],
    content: {
      instructions: "你是一位专业的财务分析师，具备深厚的财务知识...",
      serviceId: "gpt-4",
      serviceName: "GPT-4",
      temperature: 0.4,
      topP: 0.8,
      maxTokens: 2500,
    },
    authorId: "user8",
    authorName: "郑十",
    createdAt: "2024-01-11T15:20:00Z",
    updatedAt: "2024-01-24T08:50:00Z",
    version: "1.1.0",
    likes: 85,
    downloads: 189,
    views: 612,
    rating: 4.5,
    ratingCount: 29,
    status: "active",
    isPublic: true,
    isFeatured: false,
  },
];

// Mock API functions
export const mockMarketplaceService = {
  getMarketplaceItems: async (params: any): Promise<MarketplaceListResponse> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredItems = [...mockMarketplaceItems];
    
    // 关键词搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }
    
    // 类型筛选
    if (params.type && params.type !== "all") {
      filteredItems = filteredItems.filter(item => item.type === params.type);
    }
    
    // 标签筛选
    if (params.tags && params.tags.length > 0) {
      filteredItems = filteredItems.filter(item => 
        params.tags.some((tag: string) => item.tags.includes(tag))
      );
    }
    
    // 分类筛选
    if (params.category) {
      filteredItems = filteredItems.filter(item => item.category === params.category);
    }
    
    // 评分筛选
    if (params.minRating && params.minRating > 0) {
      filteredItems = filteredItems.filter(item => item.rating >= params.minRating);
    }
    
    // 排序
    switch (params.sortBy) {
      case "popular":
        filteredItems.sort((a, b) => b.likes - a.likes);
        break;
      case "rating":
        filteredItems.sort((a, b) => b.rating - a.rating);
        break;
      case "downloads":
        filteredItems.sort((a, b) => b.downloads - a.downloads);
        break;
      case "latest":
      default:
        filteredItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    // 分页
    const pageSize = params.pageSize || 12;
    const pageNumber = params.pageNumber || 1;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    return {
      success: true,
      statusCode: 200,
      message: "Success",
      data: {
        total: filteredItems.length,
        data: paginatedItems,
      },
    };
  },
  
  getCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      statusCode: 200,
      message: "Success",
      data: mockCategories,
    };
  },
  
  getTags: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      statusCode: 200,
      message: "Success",
      data: mockTags,
    };
  },
  
  getMarketplaceItemById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const item = mockMarketplaceItems.find(item => item.id === id);
    if (!item) {
      throw new Error("Item not found");
    }
    return item;
  },
  
  likeItem: async (itemId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
  
  unlikeItem: async (itemId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
  
  viewItem: async (itemId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true };
  },
  
  importToWorkspace: async (itemId: string, config: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      data: {
        success: true,
        message: "导入成功",
        targetId: `imported_${itemId}`,
      }
    };
  },
};
