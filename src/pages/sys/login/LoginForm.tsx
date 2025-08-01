import { Button, Checkbox, Col, Divider, Form, Input, Row, message } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AiFillGithub, AiFillGoogleCircle, AiFillWechat } from "react-icons/ai";

import type { SignInReq } from "@/api/services/userService";
import { useSignIn } from "@/store/userStore";
import { initiateGitHubLogin } from "@/utils/github-auth";

import {
  LoginStateEnum,
  useLoginStateContext,
} from "./providers/LoginStateProvider";

function LoginForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const { loginState, setLoginState } = useLoginStateContext();
  const signIn = useSignIn();

  if (loginState !== LoginStateEnum.LOGIN) return null;

  const handleFinish = async ({ username, password }: SignInReq) => {
    setLoading(true);
    try {
      await signIn({ username, password });
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    try {
      // 检查GitHub OAuth配置
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
      
      if (!clientId || clientId === 'your_github_client_id') {
        message.error('GitHub OAuth未配置，请联系管理员');
        return;
      }
      
      if (!redirectUri) {
        message.error('GitHub OAuth回调地址未配置');
        return;
      }
      
      // 保存当前页面，登录成功后跳转回来
      sessionStorage.setItem('redirect_after_login', window.location.pathname);
      
      // 启动GitHub登录流程
      initiateGitHubLogin();
    } catch (error) {
      console.error('GitHub登录启动失败:', error);
      message.error('GitHub登录启动失败，请稍后重试');
    }
  };

  const handleSocialLogin = (provider: string) => {
    switch (provider) {
      case 'github':
        handleGitHubLogin();
        break;
      case 'wechat':
        message.info('微信登录功能开发中...');
        break;
      case 'google':
        message.info('Google登录功能开发中...');
        break;
      default:
        message.info('该登录方式暂未支持');
    }
  };
  return (
    <>
      <div className="mb-4 text-2xl font-bold xl:text-3xl">
        {t("sys.login.signInFormTitle")}
      </div>
      <Form
        name="login"
        size="large"
        initialValues={{
          remember: true,
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: t("sys.login.accountPlaceholder") },
          ]}
        >
          <Input placeholder={t("sys.login.userName")} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: t("sys.login.passwordPlaceholder") },
          ]}
        >
          <Input.Password
            type="password"
            placeholder={t("sys.login.password")}
          />
        </Form.Item>
        <Form.Item>
          <Row align="middle">
            <Col span={12}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>{t("sys.login.rememberMe")}</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12} className="text-right">
              <Button
                type="link"
                className="!underline"
                onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)}
                size="small"
              >
                {t("sys.login.forgetPassword")}
              </Button>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={loading}
          >
            {t("sys.login.loginButton")}
          </Button>
        </Form.Item>

        <Row align="middle" gutter={8}>
          <Col span={9} flex="1">
            <Button
              className="w-full !text-sm"
              onClick={() => setLoginState(LoginStateEnum.MOBILE)}
            >
              {t("sys.login.mobileSignInFormTitle")}
            </Button>
          </Col>
          <Col span={9} flex="1">
            <Button
              className="w-full !text-sm"
              onClick={() => setLoginState(LoginStateEnum.QR_CODE)}
            >
              {t("sys.login.qrSignInFormTitle")}
            </Button>
          </Col>
          <Col
            span={6}
            flex="1"
            onClick={() => setLoginState(LoginStateEnum.REGISTER)}
          >
            <Button className="w-full !text-sm">
              {t("sys.login.signUpFormTitle")}
            </Button>
          </Col>
        </Row>

        <Divider className="!text-xs">{t("sys.login.otherSignIn")}</Divider>

        <div className="flex cursor-pointer justify-around text-2xl">
          <div 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={() => handleSocialLogin('github')}
            title="使用GitHub登录"
          >
            <AiFillGithub className="text-gray-700 hover:text-black" />
          </div>
          <div 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={() => handleSocialLogin('wechat')}
            title="使用微信登录"
          >
            <AiFillWechat className="text-green-500 hover:text-green-600" />
          </div>
          <div 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={() => handleSocialLogin('google')}
            title="使用Google登录"
          >
            <AiFillGoogleCircle className="text-red-500 hover:text-red-600" />
          </div>
        </div>
      </Form>
    </>
  );
}

export default LoginForm;
