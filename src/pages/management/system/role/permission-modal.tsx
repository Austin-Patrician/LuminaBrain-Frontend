import { Modal, Row, Col, Tree, Button, message, Spin } from "antd";
import type { TreeProps } from "antd/es/tree";
import { useState, useEffect, useMemo } from "react";
import { Iconify } from "@/components/icon";

import type { Permission, Role } from "#/entity";
import { PermissionType } from "#/enum";

export interface PermissionModalProps {
  role: Role;
  show: boolean;
  onOk: () => void;
  onCancel: () => void;
}

interface TreeNode {
  key: string;
  title: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  permission: Permission;
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

  // 获取所有权限数据
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      // 这里需要根据实际API调用权限服务
      // const response = await permissionService.getPermissionList();
      // setPermissions(response.data);

      // 临时模拟数据，实际开发时替换为真实API调用
      const mockPermissions: Permission[] = [
        {
          id: "1",
          parentId: "",
          name: "系统管理",
          label: "system.management",
          type: PermissionType.CATALOGUE,
          route: "/system",
          icon: "setting",
          children: [
            {
              id: "1-1",
              parentId: "1",
              name: "用户管理",
              label: "user.management",
              type: PermissionType.MENU,
              route: "/system/user",
              icon: "user",
              children: [],
            },
            {
              id: "1-2",
              parentId: "1",
              name: "角色管理",
              label: "role.management",
              type: PermissionType.MENU,
              route: "/system/role",
              icon: "team",
              children: [],
            },
          ],
        },
        {
          id: "2",
          parentId: "",
          name: "内容管理",
          label: "content.management",
          type: PermissionType.CATALOGUE,
          route: "/content",
          icon: "folder",
          children: [
            {
              id: "2-1",
              parentId: "2",
              name: "文章管理",
              label: "article.management",
              type: PermissionType.MENU,
              route: "/content/article",
              icon: "file-text",
              children: [],
            },
          ],
        },
      ];
      setPermissions(mockPermissions);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      message.error("获取权限数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 初始化已选中的权限
  useEffect(() => {
    if (role.permission && role.permission.length > 0) {
      const rolePermissionIds = role.permission.map((p) => p.id);
      setCheckedKeys(rolePermissionIds);
    }
  }, [role]);

  // 加载权限数据
  useEffect(() => {
    if (show) {
      fetchPermissions();
    }
  }, [show]);

  // 将权限数据转换为树形结构
  const convertToTreeData = (permissions: Permission[]): TreeNode[] => {
    return permissions.map((permission) => ({
      key: permission.id,
      title: permission.name,
      icon: permission.icon ? (
        <Iconify icon={permission.icon} size={16} />
      ) : undefined,
      permission,
      children: permission.children
        ? convertToTreeData(permission.children)
        : undefined,
    }));
  };

  // 分离CATALOGUE和MENU类型的权限
  const { cataloguePermissions, menuPermissions } = useMemo(() => {
    const catalogues = permissions.filter(
      (p) => p.type === PermissionType.CATALOGUE
    );
    const menus: Permission[] = [];

    // 递归收集所有MENU权限
    const collectMenus = (perms: Permission[]) => {
      perms.forEach((perm) => {
        if (perm.type === PermissionType.MENU) {
          menus.push(perm);
        }
        if (perm.children) {
          collectMenus(perm.children);
        }
      });
    };

    collectMenus(permissions);

    return {
      cataloguePermissions: catalogues,
      menuPermissions: menus,
    };
  }, [permissions]);

  // 处理目录权限选择
  const handleCatalogueCheck: TreeProps["onCheck"] = (_, info) => {
    // 如果选中目录，自动选中其下所有菜单
    const newCheckedKeys = new Set(checkedKeys);

    if (info.checked) {
      // 选中目录时，自动选中其下所有子菜单
      const addChildrenKeys = (node: any) => {
        newCheckedKeys.add(node.key);
        if (node.children) {
          node.children.forEach((child: any) => {
            addChildrenKeys(child);
          });
        }
      };
      addChildrenKeys(info.node);
    } else {
      // 取消选中目录时，自动取消其下所有子菜单
      const removeChildrenKeys = (node: any) => {
        newCheckedKeys.delete(node.key);
        if (node.children) {
          node.children.forEach((child: any) => {
            removeChildrenKeys(child);
          });
        }
      };
      removeChildrenKeys(info.node);
    }

    setCheckedKeys(Array.from(newCheckedKeys));
  };

  // 处理菜单权限选择
  const handleMenuCheck: TreeProps["onCheck"] = (checked) => {
    const checkedKeysArray = Array.isArray(checked) ? checked : checked.checked;
    setCheckedKeys(checkedKeysArray.map((key) => String(key)));
  };

  // 保存权限配置
  const handleSave = async () => {
    try {
      setLoading(true);

      // 这里调用更新角色权限的API
      // await roleService.updateRolePermissions(role.id, checkedKeys);

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
    <Modal
      title={`配置角色权限 - ${role.name}`}
      open={show}
      onCancel={onCancel}
      width={800}
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
        <div className="mb-4 text-gray-600">
          <p>左侧选择目录权限，选中目录会自动选中其下所有菜单权限</p>
          <p>右侧可以单独调整具体的菜单权限</p>
        </div>

        <Row gutter={16} style={{ minHeight: 400 }}>
          {/* 左侧：目录权限 */}
          <Col span={12}>
            <div className="border rounded p-4 h-full">
              <h4 className="mb-3 font-medium text-gray-800">
                <Iconify icon="folder" className="mr-2" />
                目录权限 (CATALOGUE)
              </h4>
              <Tree
                checkable
                checkedKeys={checkedKeys.filter((key) =>
                  cataloguePermissions.some((p) => p.id === key)
                )}
                onCheck={handleCatalogueCheck}
                treeData={convertToTreeData(cataloguePermissions)}
                showIcon
                height={350}
              />
            </div>
          </Col>

          {/* 右侧：菜单权限 */}
          <Col span={12}>
            <div className="border rounded p-4 h-full">
              <h4 className="mb-3 font-medium text-gray-800">
                <Iconify icon="menu" className="mr-2" />
                菜单权限 (MENU)
              </h4>
              <Tree
                checkable
                checkedKeys={checkedKeys.filter((key) =>
                  menuPermissions.some((p) => p.id === key)
                )}
                onCheck={handleMenuCheck}
                treeData={convertToTreeData(menuPermissions)}
                showIcon
                height={350}
              />
            </div>
          </Col>
        </Row>

        {/* 选中权限统计 */}
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">
            已选择权限：
            <span className="ml-2 font-medium text-blue-600">
              {checkedKeys.length} 项
            </span>
          </div>
        </div>
      </Spin>
    </Modal>
  );
}
