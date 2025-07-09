import { UserInputRequest, UserInputResponse } from '../types';

/**
 * 用户输入处理器
 * 负责处理用户输入请求和响应
 */
export class UserInputHandler {
  private userInputResolver?: (response: UserInputResponse) => void;

  /**
   * 请求用户输入
   * @param request 用户输入请求
   * @returns Promise<UserInputResponse>
   */
  async requestUserInput(request: UserInputRequest): Promise<UserInputResponse> {
    return new Promise<UserInputResponse>((resolve) => {
      this.userInputResolver = resolve;
    });
  }

  /**
   * 提交用户输入
   * @param response 用户输入响应
   */
  submitUserInput(response: UserInputResponse): void {
    if (this.userInputResolver) {
      this.userInputResolver(response);
      this.userInputResolver = undefined;
    }
  }

  /**
   * 取消用户输入等待
   */
  cancelUserInput(): void {
    if (this.userInputResolver) {
      this.userInputResolver({
        stepId: '',
        value: '',
        timestamp: Date.now()
      });
      this.userInputResolver = undefined;
    }
  }

  /**
   * 检查是否正在等待用户输入
   */
  isWaitingForInput(): boolean {
    return !!this.userInputResolver;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.cancelUserInput();
  }
}

export default UserInputHandler;
