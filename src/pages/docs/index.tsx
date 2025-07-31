import {
  ApiOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CloudOutlined,
  CrownOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  GithubOutlined,
  GlobalOutlined,
  HeartOutlined,
  LinkedinOutlined,
  LoadingOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  PhoneOutlined,
  RocketOutlined,
  SafetyOutlined,
  StarOutlined,
  TabletOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  TwitterOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Button, Card, Divider, Modal, Progress, Space, Tag, Typography } from 'antd';
import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router";
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 }
};

const fadeInLeft = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 }
};

const fadeInRight = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const DocsPage: React.FC = () => {
  const featuresRef = useRef(null);
  const useCasesRef = useRef(null);
  const pricingRef = useRef(null);
  const contactRef = useRef(null);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const featuresInView = useInView(featuresRef, { once: false, margin: "-100px" });
  const useCasesInView = useInView(useCasesRef, { once: false, margin: "-100px" });
  const pricingInView = useInView(pricingRef, { once: false, margin: "-100px" });
  const contactInView = useInView(contactRef, { once: false, margin: "-100px" });

  const handleStartExplore = () => {
    setIsModalVisible(true);
    setProgress(0);

    // 启动进度条动画
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsModalVisible(false);
            navigate('/');
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section - 引言 */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="relative container mx-auto px-6 py-24">
            <m.div
              className="text-center max-w-4xl mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.8 }}
            >
              <m.h1
                className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
                variants={fadeInUp}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                LuminaBrain
              </m.h1>
              <m.p
                className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed"
                variants={fadeInUp}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                下一代智能AI助手平台，为您提供强大的人工智能解决方案
              </m.p>
              <m.p
                className="text-lg text-blue-200 mb-12 max-w-3xl mx-auto"
                variants={fadeInUp}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                本文档将帮助您全面了解LuminaBrain的核心功能、应用场景、定价方案和联系方式，
                让您快速掌握如何利用AI技术提升工作效率和创新能力。
              </m.p>
              <m.div
                variants={fadeInUp}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Button
                  type="primary"
                  size="large"
                  className="bg-white text-blue-600 border-none hover:bg-blue-50 h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  icon={<RocketOutlined />}
                  onClick={handleStartExplore}
                >
                  开始探索
                </Button>
              </m.div>
            </m.div>
          </div>
        </section>

        {/* Core Features - 核心功能 */}
        <section ref={featuresRef} className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <m.div
              className="text-center mb-16"
              variants={fadeInUp}
              initial="initial"
              animate={featuresInView ? "animate" : "initial"}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                核心功能
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                LuminaBrain提供三大核心功能，助力您的AI之旅
              </p>
            </m.div>

            <m.div
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate={featuresInView ? "animate" : "initial"}
            >
              <m.div variants={fadeInUp} transition={{ duration: 0.6 }}>
                <Card
                  className="h-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-blue-50 to-indigo-100 group hover:-translate-y-2"
                  bodyStyle={{ padding: '2rem' }}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <BulbOutlined className="text-3xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">智能对话助手</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      基于先进的大语言模型，提供自然流畅的对话体验。支持多轮对话、上下文理解，
                      能够处理复杂问题并提供准确、有用的回答。
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Tag color="blue">自然语言处理</Tag>
                      <Tag color="purple">多轮对话</Tag>
                      <Tag color="cyan">上下文理解</Tag>
                    </div>
                  </div>
                </Card>
              </m.div>

              <m.div variants={fadeInUp} transition={{ duration: 0.6, delay: 0.2 }}>
                <Card
                  className="h-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-purple-50 to-pink-100 group hover:-translate-y-2"
                  bodyStyle={{ padding: '2rem' }}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <DatabaseOutlined className="text-3xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">知识库管理</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      强大的知识库系统，支持文档上传、智能索引和语义搜索。
                      让AI助手能够基于您的专业知识提供更精准的答案。
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Tag color="purple">文档管理</Tag>
                      <Tag color="magenta">语义搜索</Tag>
                      <Tag color="red">智能索引</Tag>
                    </div>
                  </div>
                </Card>
              </m.div>

              <m.div variants={fadeInUp} transition={{ duration: 0.6, delay: 0.4 }}>
                <Card
                  className="h-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-green-50 to-emerald-100 group hover:-translate-y-2"
                  bodyStyle={{ padding: '2rem' }}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <ApiOutlined className="text-3xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">智能工作流</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      可视化工作流编辑器，支持拖拽式创建复杂的AI处理流程。
                      集成多种AI模型和工具，实现自动化的智能任务处理。
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Tag color="green">可视化编辑</Tag>
                      <Tag color="lime">自动化流程</Tag>
                      <Tag color="orange">模型集成</Tag>
                    </div>
                  </div>
                </Card>
              </m.div>
            </m.div>
          </div>
        </section>

        {/* Use Cases - 应用场景 */}
        <section ref={useCasesRef} className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="container mx-auto px-6">
            <m.div
              className="text-center mb-16"
              variants={fadeInUp}
              initial="initial"
              animate={useCasesInView ? "animate" : "initial"}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                应用场景
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                LuminaBrain在多个领域展现出色表现，为不同行业提供定制化解决方案
              </p>
            </m.div>

            <div className="grid md:grid-cols-2 gap-12">
              <m.div
                variants={fadeInLeft}
                initial="initial"
                animate={useCasesInView ? "animate" : "initial"}
                transition={{ duration: 0.8 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                        <TeamOutlined className="text-2xl text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">企业客服自动化</h3>
                    </div>
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">面临的问题：</h4>
                      <p className="text-gray-600 leading-relaxed">
                        传统客服系统响应速度慢，人工成本高，无法24小时提供服务，
                        常见问题重复回答效率低下，客户满意度难以提升。
                      </p>
                    </div>
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">解决方案：</h4>
                      <p className="text-gray-600 leading-relaxed">
                        部署LuminaBrain智能客服系统，基于企业知识库训练专属AI助手。
                        实现7×24小时自动回复，处理80%常见问题，复杂问题智能转人工，
                        大幅提升客户体验和服务效率。
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Tag color="blue" icon={<CheckCircleOutlined />}>24小时服务</Tag>
                      <Tag color="green" icon={<ThunderboltOutlined />}>快速响应</Tag>
                      <Tag color="purple" icon={<HeartOutlined />}>提升满意度</Tag>
                    </div>
                  </div>
                </Card>
              </m.div>

              <m.div
                variants={fadeInRight}
                initial="initial"
                animate={useCasesInView ? "animate" : "initial"}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                        <BulbOutlined className="text-2xl text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">教育培训助手</h3>
                    </div>
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">面临的问题：</h4>
                      <p className="text-gray-600 leading-relaxed">
                        教育机构师资有限，无法为每个学生提供个性化辅导，
                        学习资源分散，学生自主学习效率低，知识点掌握情况难以跟踪。
                      </p>
                    </div>
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">解决方案：</h4>
                      <p className="text-gray-600 leading-relaxed">
                        构建智能教学助手，整合课程知识库，为学生提供个性化答疑。
                        支持多种学习方式，实时跟踪学习进度，生成个性化学习建议，
                        让每个学生都能获得专属的AI导师。
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Tag color="purple" icon={<StarOutlined />}>个性化学习</Tag>
                      <Tag color="orange" icon={<TrophyOutlined />}>智能辅导</Tag>
                      <Tag color="cyan" icon={<GlobalOutlined />}>随时随地</Tag>
                    </div>
                  </div>
                </Card>
              </m.div>
            </div>
          </div>
        </section>

        {/* Pricing - 定价方案 */}
        <section ref={pricingRef} className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <m.div
              className="text-center mb-16"
              variants={fadeInUp}
              initial="initial"
              animate={pricingInView ? "animate" : "initial"}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                定价方案
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                灵活的定价计划，满足个人用户到企业客户的不同需求
              </p>
            </m.div>

            <m.div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              animate={pricingInView ? "animate" : "initial"}
            >
              {/* 免费版 */}
              <m.div variants={scaleIn} transition={{ duration: 0.6 }}>
                <Card className="h-full text-center hover:shadow-xl transition-all duration-500 border-2 border-gray-200 hover:border-blue-300">
                  <div className="p-8 flex flex-col h-full">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MobileOutlined className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">免费版</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-800">¥0</span>
                      <span className="text-gray-600">/月</span>
                    </div>
                    <ul className="text-left space-y-3 mb-8 flex-1">
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>每日100次对话</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>基础AI模型</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>社区支持</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>基础知识库(1GB)</span>
                      </li>
                    </ul>
                    <div className="mt-auto">
                      <Button type="default" size="large" className="w-full">
                        免费开始
                      </Button>
                    </div>
                  </div>
                </Card>
              </m.div>

              {/* 专业版 */}
              <m.div variants={scaleIn} transition={{ duration: 0.6, delay: 0.2 }}>
                <Card className="h-full text-center hover:shadow-xl transition-all duration-500 border-2 border-blue-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold">
                    推荐
                  </div>
                  <div className="p-8 flex flex-col h-full">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <DesktopOutlined className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">专业版</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-blue-600">¥99</span>
                      <span className="text-gray-600">/月</span>
                    </div>
                    <ul className="text-left space-y-3 mb-8 flex-1">
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>无限对话次数</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>高级AI模型</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>优先技术支持</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>扩展知识库(50GB)</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>工作流编辑器</span>
                      </li>
                    </ul>
                    <div className="mt-auto">
                      <Button type="primary" size="large" className="w-full bg-blue-600 border-blue-600">
                        立即升级
                      </Button>
                    </div>
                  </div>
                </Card>
              </m.div>

              {/* 企业版 */}
              <m.div variants={scaleIn} transition={{ duration: 0.6, delay: 0.4 }}>
                <Card className="h-full text-center hover:shadow-xl transition-all duration-500 border-2 border-purple-500">
                  <div className="p-8 flex flex-col h-full">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CrownOutlined className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">企业版</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-purple-600">¥999</span>
                      <span className="text-gray-600">/月</span>
                    </div>
                    <ul className="text-left space-y-3 mb-8 flex-1">
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>企业级部署</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>定制AI模型</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>专属技术支持</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>无限知识库存储</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>API集成</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <span>数据安全保障</span>
                      </li>
                    </ul>
                    <div className="mt-auto">
                      <Button type="primary" size="large" className="w-full bg-purple-600 border-purple-600">
                        联系销售
                      </Button>
                    </div>
                  </div>
                </Card>
              </m.div>
            </m.div>

            <m.div
              className="text-center mt-12"
              variants={fadeInUp}
              initial="initial"
              animate={pricingInView ? "animate" : "initial"}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
                <h4 className="text-2xl font-bold text-gray-800 mb-4">特别优惠</h4>
                <p className="text-lg text-gray-600 mb-4">
                  🎉 新用户专享：专业版首月5折优惠，企业版免费试用30天
                </p>
                <p className="text-gray-500">
                  📞 年付用户额外享受8.5折优惠 | 💬 学生用户凭证享受专业版半价
                </p>
              </div>
            </m.div>
          </div>
        </section>

        {/* Contact - 联系我们 */}
        <section ref={contactRef} className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="relative container mx-auto px-6">
            <m.div
              className="text-center mb-16"
              variants={fadeInUp}
              initial="initial"
              animate={contactInView ? "animate" : "initial"}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                联系我们
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                我们随时为您提供专业的技术支持和咨询服务
              </p>
            </m.div>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <m.div
                variants={fadeInLeft}
                initial="initial"
                animate={contactInView ? "animate" : "initial"}
                transition={{ duration: 0.8 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white h-full">
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-8">联系方式</h3>
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                          <MailOutlined className="text-xl" />
                        </div>
                        <div>
                          <p className="font-semibold">邮箱地址</p>
                          <p className="text-blue-100">support@luminabrain.com</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                          <PhoneOutlined className="text-xl" />
                        </div>
                        <div>
                          <p className="font-semibold">客服热线</p>
                          <p className="text-blue-100">400-888-0123</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                          <GlobalOutlined className="text-xl" />
                        </div>
                        <div>
                          <p className="font-semibold">服务时间</p>
                          <p className="text-blue-100">周一至周日 9:00-21:00</p>
                        </div>
                      </div>
                    </div>

                    <Divider className="border-white/20 my-8" />

                    <div>
                      <h4 className="text-lg font-semibold mb-4">社交媒体</h4>
                      <div className="flex space-x-4">
                        <Button
                          type="text"
                          icon={<GithubOutlined />}
                          className="text-white hover:text-blue-200 hover:bg-white/10"
                          size="large"
                        />
                        <Button
                          type="text"
                          icon={<TwitterOutlined />}
                          className="text-white hover:text-blue-200 hover:bg-white/10"
                          size="large"
                        />
                        <Button
                          type="text"
                          icon={<LinkedinOutlined />}
                          className="text-white hover:text-blue-200 hover:bg-white/10"
                          size="large"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </m.div>

              <m.div
                variants={fadeInRight}
                initial="initial"
                animate={contactInView ? "animate" : "initial"}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white h-full">
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-8">快速响应承诺</h3>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                          <CheckCircleOutlined className="text-sm" />
                        </div>
                        <div>
                          <p className="font-semibold mb-2">邮件咨询</p>
                          <p className="text-blue-100">工作日内2小时响应，节假日24小时内回复</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                          <CheckCircleOutlined className="text-sm" />
                        </div>
                        <div>
                          <p className="font-semibold mb-2">电话支持</p>
                          <p className="text-blue-100">专业版用户优先接听，企业版用户专线服务</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                          <CheckCircleOutlined className="text-sm" />
                        </div>
                        <div>
                          <p className="font-semibold mb-2">在线客服</p>
                          <p className="text-blue-100">智能客服24小时在线，复杂问题转人工处理</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded-lg">
                      <p className="text-sm text-blue-100">
                        💡 提示：企业用户可申请专属客户成功经理，
                        享受一对一技术支持和定期业务回顾服务。
                      </p>
                    </div>
                  </div>
                </Card>
              </m.div>
            </div>
          </div>
        </section>

        {/* Footer with LuminaBrain Logo */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-6">
            <m.div
              className="text-center"
              variants={fadeInUp}
              initial="initial"
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <h2 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                  LuminaBrain
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  点亮智慧之光，开启AI新时代
                </p>
              </div>

              <div className="border-t border-gray-700 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <p className="text-gray-400">
                      版本 1.0 | 发布日期：2025年8月1日
                    </p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">隐私政策</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">服务条款</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">帮助中心</a>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-500 text-sm">
                    © 2024 LuminaBrain. All rights reserved. | 本文档遵循无障碍设计标准，支持屏幕阅读器访问
                  </p>
                </div>
              </div>
            </m.div>
          </div>
        </footer>

        {/* 准备跳转弹窗 */}
        <Modal
          title={null}
          open={isModalVisible}
          footer={null}
          closable={false}
          centered
          width={500}
          bodyStyle={{ padding: '40px' }}
        >
          <div className="text-center">
            <div className="mb-6">
              <LoadingOutlined className="text-4xl text-blue-600 mb-4" spin />
              <Typography.Title level={3} className="text-gray-800 mb-2">
                正在准备跳转服务...
              </Typography.Title>
              <Typography.Text className="text-gray-600">
                请稍候，系统正在为您准备最佳体验
              </Typography.Text>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
              <Typography.Title level={4} className="text-gray-800 mb-4">
                🎉 欢迎测试使用 LuminaBrain
              </Typography.Title>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <Typography.Title level={5} className="text-gray-700 mb-3">
                  测试账号信息
                </Typography.Title>

                <Space direction="vertical" className="w-full" size="middle">
                  <div className="flex items-center justify-between bg-gray-50 rounded p-3">
                    <div className="flex items-center">
                      <UserOutlined className="text-blue-600 mr-2" />
                      <span className="text-gray-600">用户名:</span>
                    </div>
                    <Typography.Text strong className="text-gray-800">
                      Austin
                    </Typography.Text>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded p-3">
                    <div className="flex items-center">
                      <LockOutlined className="text-blue-600 mr-2" />
                      <span className="text-gray-600">密码:</span>
                    </div>
                    <Typography.Text strong className="text-gray-800">
                      test
                    </Typography.Text>
                  </div>
                </Space>
              </div>

              <Typography.Text className="text-gray-600 text-sm mt-3 block">
                💡 您可以使用以上账号体验完整功能
              </Typography.Text>
            </div>

            <div className="mb-4">
              <Progress
                percent={progress}
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#52c41a',
                }}
                showInfo={false}
                className="mb-2"
              />
              <Typography.Text className="text-gray-500 text-sm">
                {progress < 100 ? `准备中... ${progress}%` : '准备完成，即将跳转'}
              </Typography.Text>
            </div>
          </div>
        </Modal>
      </div>
    </LazyMotion>
  );
};

export default DocsPage;