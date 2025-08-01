import { Modal, Button, message, Spin, Tree } from "antd";
import { useState, useEffect, useMemo } from "react";
import { Iconify } from "@/components/icon";
import type { TreeDataNode } from "antd/es/tree";

import type { Permission, Role } from "#/entity";
import { PermissionType } from "#/enum";
import permissionService from "@/api/services/permissionService";
import roleService from "@/api/services/roleService";

export interface PermissionModalProps {
  role: Role;
  show: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export default function PermissionModal({
  role,
  show,
  onOk,
  onCancel,
}: PermissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  // 获取角色已有权限
  const fetchRolePermissions = async () => {
    try {
      const response = await roleService.getRolePermissions(role.id);
      // 确保response是数组且包含有效数据
      if (Array.isArray(response) && response.length > 0) {
        // 提取权限ID列表，确保ID存在且有效
        const rolePermissionIds = response
          .filter((p: any) => p && p.id)
          .map((p: any) => p.id);
        setCheckedKeys(rolePermissionIds);
      } else {
        // 如果没有权限数据，设置为空数组
        setCheckedKeys([]);
      }
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
      // 获取失败时设置为空数组，不使用备用逻辑
      setCheckedKeys([]);
      message.error("获取角色权限失败");
    }
  };

  // 获取所有权限数据
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await permissionService.getPermissionList();
      // 递归转换API返回的类型字符串为枚举值
      const convertPermissionType = (type): PermissionType => {
        switch (type) {
          case 0:
            return PermissionType.CATALOGUE;
          case 1:
            return PermissionType.MENU;
          case 2:
            return PermissionType.BUTTON;
          default:
            return PermissionType.MENU; // 默认为菜单类型
        }
      };

      // 递归转换嵌套的权限数据结构
      const convertPermissions = (permissionList: any[]): Permission[] => {
        return permissionList.map(
          (permission: any): Permission => ({
            ...permission,
            type: convertPermissionType(permission.type),
            children: permission.children ? convertPermissions(permission.children) : undefined,
          })
        );
      };

      const convertedPermissions = convertPermissions(response || []);

      setPermissions(convertedPermissions);
    } catch (error) {
      message.error("获取权限数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载权限数据
  useEffect(() => {
    if (show) {
      // 先清空已选中的权限
      setCheckedKeys([]);
      fetchPermissions();
      fetchRolePermissions();
    } else {
      // 模态框关闭时清空状态
      setCheckedKeys([]);
      setPermissions([]);
    }
  }, [show]);

  // 当role变化时，重新获取权限数据
  useEffect(() => {
    if (show && role.id) {
      setCheckedKeys([]);
      fetchRolePermissions();
    }
  }, [role.id, show]);

  // 权限树结构（API已返回嵌套结构）
  const permissionTree = useMemo(() => {
    return permissions || [];
  }, [permissions]);

  // 将权限数据转换为Tree组件需要的数据结构
  const treeData = useMemo(() => {
    const convertToTreeData = (permissions: Permission[]): TreeDataNode[] => {
      return permissions.map((permission) => {
        const getIcon = () => {
          if (permission.type === PermissionType.CATALOGUE) {
            return <Iconify icon={permission.icon || "folder"} className="mr-1" />;
          } else if (permission.type === PermissionType.MENU) {
            return <Iconify icon={permission.icon || "menu"} className="mr-1" />;
          } else {
            return <Iconify icon="button" className="mr-1" />;
          }
        };

        const getTypeTag = () => {
          const typeColors = {
            [PermissionType.CATALOGUE]: "#1890ff",
            [PermissionType.MENU]: "#52c41a",
            [PermissionType.BUTTON]: "#fa8c16",
          };
          const typeNames = {
            [PermissionType.CATALOGUE]: "目录",
            [PermissionType.MENU]: "菜单",
            [PermissionType.BUTTON]: "按钮",
          };
          return (
            <span
              style={{
                color: typeColors[permission.type],
                fontSize: "12px",
                marginLeft: "8px",
              }}
            >
              [{typeNames[permission.type]}]
            </span>
          );
        };

        return {
          key: permission.id,
          title: (
            <span className="flex items-center">
              {getIcon()}
              <span>{permission.name}</span>
              {getTypeTag()}
            </span>
          ),
          children: permission.children ? convertToTreeData(permission.children) : undefined,
        };
      });
    };

    return convertToTreeData(permissionTree);
  }, [permissionTree]);

  // 获取所有权限ID的扁平列表（用于权限选择处理）
  const allPermissionIds = useMemo(() => {
    const collectIds = (permissions: Permission[]): string[] => {
      let ids: string[] = [];
      permissions.forEach((permission) => {
        ids.push(permission.id);
        if (permission.children) {
          ids = ids.concat(collectIds(permission.children));
        }
      });
      return ids;
    };
    return collectIds(permissionTree);
  }, [permissionTree]);

  // 处理Tree组件的权限选择
  const handleTreeCheck = (checkedKeysValue: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
    // 处理checkStrictly模式下的返回值
    if (Array.isArray(checkedKeysValue)) {
      setCheckedKeys(checkedKeysValue as string[]);
    } else {
      // checkStrictly模式下，只使用checked数组
      setCheckedKeys(checkedKeysValue.checked as string[]);
    }
  };

  // 获取权限统计信息
  const getPermissionStats = () => {
    const allPermissions: Permission[] = [];
    const collectAll = (perms: Permission[]) => {
      perms.forEach((p) => {
        allPermissions.push(p);
        if (p.children) collectAll(p.children);
      });
    };
    collectAll(permissionTree);

    const catalogueCount = checkedKeys.filter((key) =>
      allPermissions.some(
        (p) => p.id === key && p.type === PermissionType.CATALOGUE
      )
    ).length;

    const menuCount = checkedKeys.filter((key) =>
      allPermissions.some(
        (p) => p.id === key && p.type === PermissionType.MENU
      )
    ).length;

    const buttonCount = checkedKeys.filter((key) =>
      allPermissions.some(
        (p) => p.id === key && p.type === PermissionType.BUTTON
      )
    ).length;

    return { catalogueCount, menuCount, buttonCount };
  };

  const permissionStats = getPermissionStats();

  // 保存权限配置
  const handleSave = async () => {
    try {
      setLoading(true);

      // 调用更新角色权限的API
      await roleService.updateRolePermissions(role.id, checkedKeys);

      message.success("权限配置保存成功");
      onOk();
    } catch (error) {
      console.error("Failed to save permissions:", error);
      message.error("保存权限配置失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .permission-tree .ant-tree-node-content-wrapper {
          padding: 6px 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }
        
        .permission-tree .ant-tree-node-content-wrapper:hover {
          background-color: #f0f9ff;
          border: 1px solid #e0f2fe;
        }
        
        .permission-tree .ant-tree-node-selected .ant-tree-node-content-wrapper {
          background-color: #dbeafe;
          border: 1px solid #93c5fd;
        }
        
        .permission-tree .ant-tree-checkbox {
          margin-right: 8px;
        }
        
        .permission-tree .ant-tree-checkbox-checked .ant-tree-checkbox-inner {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .permission-tree .ant-tree-switcher {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          margin-right: 4px;
        }
        
        .permission-tree .ant-tree-switcher-icon {
          font-size: 12px;
          color: #6b7280;
        }
        
        .permission-tree .ant-tree-title {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }
        
        .permission-tree .ant-tree-treenode {
          margin-bottom: 2px;
        }
        
        .permission-tree .ant-tree-indent-unit {
          width: 20px;
        }
      `}</style>
      <Modal
        title={`配置角色权限 - ${role.name}`}
        open={show}
        onCancel={onCancel}
        width={1200}
        style={{ top: 20 }}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loading}
            onClick={handleSave}
          >
            保存
          </Button>,
        ]}
      >
      <Spin spinning={loading}>
        {/* 权限统计信息 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Iconify icon="mdi:chart-pie" className="text-blue-600 text-lg" />
              <span className="font-medium text-gray-700">权限统计</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">目录: <span className="font-semibold text-blue-600">{permissionStats.catalogueCount}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">菜单: <span className="font-semibold text-green-600">{permissionStats.menuCount}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">按钮: <span className="font-semibold text-orange-600">{permissionStats.buttonCount}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <Iconify icon="mdi:check-circle" className="text-indigo-600" />
                <span className="text-gray-600">已选: <span className="font-semibold text-indigo-600">{checkedKeys.length}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* 权限树 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-2">
              <Iconify icon="mdi:file-tree" className="text-gray-600" />
              <span className="font-medium text-gray-700">权限树形结构</span>
              <span className="text-sm text-gray-500">({treeData.length} 个根权限)</span>
            </div>
          </div>
          
          <div className="p-4">
            {treeData.length > 0 ? (
              <div className="max-h-[450px] overflow-y-auto">
                <Tree
                  checkable
                  checkStrictly
                  checkedKeys={checkedKeys}
                  onCheck={handleTreeCheck}
                  treeData={treeData}
                  defaultExpandAll
                  showLine={{ showLeafIcon: false }}
                  className="permission-tree"
                  style={{
                    fontSize: '14px',
                    lineHeight: '2.2',
                    width: '100%'
                  }}
                />
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <Iconify
                  icon="mdi:database-off"
                  size={48}
                  className="mx-auto mb-4 text-gray-300"
                />
                <p className="text-lg">暂无权限数据</p>
                <p className="text-sm">请联系管理员配置系统权限</p>
              </div>
            )}
          </div>
        </div>
       </Spin>
     </Modal>
    </>
    );
}
