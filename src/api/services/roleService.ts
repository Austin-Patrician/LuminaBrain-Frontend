import apiClient from "@/api/apiClient";
import type { 
  Role, 
  RoleListResponse 
} from "#/entity";

// 角色查询参数
interface RoleSearchParams {
  statusId?: string | null;
  name?: string | null;
  pageNumber?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
}

// 角色创建DTO
interface CreateRoleDto {
  name: string;
  label: string;
  description?: string;
  code?: string;
  statusId?: string;
}

// 角色更新DTO
interface UpdateRoleDto extends CreateRoleDto {
  id: string;
}

export enum RoleApi {
  // 角色API
  QueryRoleList = "/powers/page",
  QueryRoleById = "/powers",
  AddRole = "/powers/add",
  UpdateRole = "/powers/update",
  DeleteRole = "/powers/delete",
}

/**
 * Role Service - handles all API requests related to roles
 */
const roleService = {
  /**
   * 获取角色列表（分页）
   */
  getRoleList: (params?: RoleSearchParams) => {
    const requestData = {
      statusId: params?.statusId || null,
      name: params?.name || null,
      pageNumber: params?.pageNumber || 1,
      pageSize: params?.pageSize || 10,
      skip: params?.skip || 1,
      take: params?.take || 1
    };
    
    return apiClient.post<RoleListResponse>({
      url: RoleApi.QueryRoleList,
      data: requestData,
    });
  },

  /**
   * 根据ID获取角色详情
   */
  getRoleById: (id: string) => {
    return apiClient.get<Role>({
      url: `${RoleApi.QueryRoleById}/${id}`,
    });
  },

  /**
   * 创建新角色
   */
  createRole: (data: CreateRoleDto) => {
    return apiClient.post<Role>({
      url: RoleApi.AddRole,
      data,
    });
  },

  /**
   * 更新角色
   */
  updateRole: (data: UpdateRoleDto) => {
    return apiClient.put<Role>({
      url: RoleApi.UpdateRole,
      data,
    });
  },

  /**
   * 删除角色
   */
  deleteRole: (id: string) => {
    return apiClient.delete<void>({
      url: `${RoleApi.DeleteRole}/${id}`,
    });
  },
};

export default roleService;
export type { 
  RoleSearchParams, 
  CreateRoleDto, 
  UpdateRoleDto 
};