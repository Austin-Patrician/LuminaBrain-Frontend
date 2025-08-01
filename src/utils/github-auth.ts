/**
 * GitHub OAuth 认证工具函数
 */

// 生成随机状态字符串，用于防止CSRF攻击
export const generateState = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// 构建GitHub OAuth授权URL
export const buildGitHubAuthUrl = (): string => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
  const state = generateState();
  
  // 将state保存到sessionStorage，用于后续验证
  sessionStorage.setItem('github_oauth_state', state);
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'user:email',
    state: state,
    allow_signup: 'true'
  });
  
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

// 验证回调状态
export const validateState = (returnedState: string): boolean => {
  const savedState = sessionStorage.getItem('github_oauth_state');
  sessionStorage.removeItem('github_oauth_state');
  return savedState === returnedState;
};

// 从URL中提取授权码和状态
export const extractAuthParams = (url: string) => {
  const urlParams = new URLSearchParams(new URL(url).search);
  return {
    code: urlParams.get('code'),
    state: urlParams.get('state'),
    error: urlParams.get('error'),
    error_description: urlParams.get('error_description')
  };
};

// 启动GitHub OAuth登录流程
export const initiateGitHubLogin = (): void => {
  const authUrl = buildGitHubAuthUrl();
  window.location.href = authUrl;
};