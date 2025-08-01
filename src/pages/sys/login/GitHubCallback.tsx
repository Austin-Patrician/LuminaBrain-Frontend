import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { message, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import { validateState, extractAuthParams } from '@/utils/github-auth';
import userService from '@/api/services/userService';
import { useSignIn } from '@/store/userStore';

/**
 * GitHub OAuth 回调处理组件
 */
function GitHubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const signIn = useSignIn();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { code, state, error, error_description } = extractAuthParams(window.location.href);
        
        // 检查是否有错误
        if (error) {
          message.error(`GitHub登录失败: ${error_description || error}`);
          navigate('/login');
          return;
        }
        
        // 检查必要参数
        if (!code || !state) {
          message.error('GitHub登录参数缺失');
          navigate('/login');
          return;
        }
        
        // 验证state参数，防止CSRF攻击
        if (!validateState(state)) {
          message.error('GitHub登录状态验证失败，可能存在安全风险');
          navigate('/login');
          return;
        }
        
        // 调用后端API进行GitHub认证
        const response = await userService.githubAuth({ code, state });
        
        if (response) {
          message.success('GitHub登录成功！');
          // 这里需要根据你的用户store实现来处理登录状态
          // 假设signIn函数可以接受token和用户信息
          await signIn({
            username: response.user.username,
            password: '' // GitHub登录不需要密码
          });
          
          // 跳转到首页或指定页面
          const redirectTo = sessionStorage.getItem('redirect_after_login') || '/dashboard';
          sessionStorage.removeItem('redirect_after_login');
          navigate(redirectTo);
        }
      } catch (error: any) {
        console.error('GitHub登录处理失败:', error);
        message.error(`GitHub登录失败: ${error.message || '未知错误'}`);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, signIn]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Spin size="large" />
        <div className="mt-4 text-lg text-gray-600">
          正在处理GitHub登录...
        </div>
        <div className="mt-2 text-sm text-gray-400">
          请稍候，我们正在验证您的GitHub账户
        </div>
      </div>
    </div>
  );
}

export default GitHubCallback;