import apiClient from "@/api/apiClient";
import type { Permission } from "#/entity";
import type { Result } from "#/api";

// 权限API枚举
export enum PermissionApi {
  GetAll = "/permission/all",
}

// 权限服务类
class PermissionService {
  /**
   * 获取所有权限列表
   * @returns 权限列表
   */
  async getPermissionList(): Promise<Result<Permission[]>> {
    return apiClient.get<Result<Permission[]>>({ url: PermissionApi.GetAll });
  }
}

// 导出权限服务实例
const permissionService = new PermissionService();
export default permissionService;
