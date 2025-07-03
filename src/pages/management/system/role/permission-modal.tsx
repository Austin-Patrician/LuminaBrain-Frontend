import { Modal, Button, message, Spin, Checkbox } from "antd";
import { useState, useEffect, useMemo } from "react";
import { Iconify } from "@/components/icon";

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
      // 提取权限ID列表
      const rolePermissionIds = response.map((p: any) => p.id);
      setCheckedKeys(rolePermissionIds);
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
      // 如果获取失败，保持原有逻辑作为备用
      if (role.permission && role.permission.length > 0) {
        const rolePermissionIds = role.permission.map((p) => p.id);
        setCheckedKeys(rolePermissionIds);
      }
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

      // 递归转换嵌套的权限数据，保持原有的嵌套结构
      const convertPermissionsRecursively = (
        permissionList: any[]
      ): Permission[] => {
        return permissionList.map(
          (permission: any): Permission => ({
            ...permission,
            type: convertPermissionType(permission.type),
            children: permission.children
              ? convertPermissionsRecursively(permission.children)
              : [],
          })
        );
      };

      const convertedPermissions = convertPermissionsRecursively(
        response || []
      );

      setPermissions(convertedPermissions);
    } catch (error) {
      message.error("获取权限数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 初始化已选中的权限（备用逻辑，主要通过API获取）
  useEffect(() => {
    if (!show && role.permission && role.permission.length > 0) {
      const rolePermissionIds = role.permission.map((p) => p.id);
      setCheckedKeys(rolePermissionIds);
    }
  }, [role, show]);

  // 加载权限数据
  useEffect(() => {
    if (show) {
      fetchPermissions();
      fetchRolePermissions();
    }
  }, [show]);

  // 构建权限树结构（直接使用API返回的嵌套结构）
  const permissionTree = useMemo(() => {
    // 如果权限数据已经包含children，直接使用顶级权限
    const rootPermissions = permissions.filter(
      (p) => !p.parentId || p.parentId === ""
    );

    return rootPermissions;
  }, [permissions]);

  // 按目录分组的菜单权限（支持多层嵌套CATALOGUE -> CATALOGUE -> MENU）
  const menusByCategory = useMemo(() => {
    const result: Record<
      string,
      { catalogue: Permission; menus: Permission[] }
    > = {};

    // 递归收集菜单，将所有MENU都归属到根CATALOGUE
    const collectMenusForCatalogue = (catalogue: Permission): Permission[] => {
      const menus: Permission[] = [];

      // 递归查找此CATALOGUE下的所有MENU（包括嵌套CATALOGUE下的MENU）
      const findMenusRecursively = (currentPermission: Permission) => {
        if (
          currentPermission.children &&
          currentPermission.children.length > 0
        ) {
          currentPermission.children.forEach((child) => {
            if (child.type === PermissionType.MENU) {
              menus.push(child);
            } else if (child.type === PermissionType.CATALOGUE) {
              // 如果是嵌套的CATALOGUE，继续递归查找其下的MENU
              findMenusRecursively(child);
            } else {
              // 其他类型权限，继续递归
              findMenusRecursively(child);
            }
          });
        }
      };

      findMenusRecursively(catalogue);
      return menus;
    };

    // 只处理顶级CATALOGUE权限，子CATALOGUE的MENU会被包含在父CATALOGUE中
    permissionTree.forEach((permission) => {
      if (permission.type === PermissionType.CATALOGUE) {
        const menus = collectMenusForCatalogue(permission);
        result[permission.id] = {
          catalogue: permission,
          menus,
        };
        console.log(
          `Top-level Catalogue "${permission.name}" contains ${menus.length} menus:`,
          menus.map((m) => m.name)
        ); // 调试信息
      }
    });

    // 处理顶级MENU权限（没有CATALOGUE父节点的菜单）
    const topLevelMenus = permissionTree.filter(
      (p) => p.type === PermissionType.MENU
    );
    if (topLevelMenus.length > 0) {
      result["_TOP_LEVEL_MENUS_"] = {
        catalogue: {
          id: "_TOP_LEVEL_MENUS_",
          parentId: "",
          name: "独立菜单",
          label: "standalone.menus",
          type: PermissionType.CATALOGUE,
          route: "",
          icon: "menu-fold",
        } as Permission,
        menus: topLevelMenus,
      };
    }

    console.log("MenusByCategory result:", result); // 调试信息
    return result;
  }, [permissionTree, permissions]);

  // 获取所有顶级目录权限（只包含顶级CATALOGUE和独立菜单组）
  const cataloguePermissions = useMemo(() => {
    const catalogues = permissionTree.filter(
      (p) => p.type === PermissionType.CATALOGUE
    );
    const topLevelMenus = permissionTree.filter(
      (p) => p.type === PermissionType.MENU
    );

    // 如果有顶级菜单，添加一个虚拟的目录节点
    if (topLevelMenus.length > 0) {
      catalogues.push({
        id: "_TOP_LEVEL_MENUS_",
        parentId: "",
        name: "独立菜单",
        label: "standalone.menus",
        type: PermissionType.CATALOGUE,
        route: "",
        icon: "menu-fold",
      } as Permission);
    }

    console.log("Catalogue Permissions (Top-level only):", catalogues); // 调试信息
    return catalogues;
  }, [permissionTree]);

  // 检查目录是否被选中（递归考虑所有嵌套层级）
  const getCatalogueCheckState = (catalogueId: string) => {
    // 递归获取目录下所有子权限ID（包括嵌套CATALOGUE和其下的MENU、BUTTON等）
    const getAllChildrenIds = (permission: Permission): string[] => {
      let ids: string[] = [];
      if (permission.children && permission.children.length > 0) {
        permission.children.forEach((child) => {
          ids.push(child.id);
          ids = ids.concat(getAllChildrenIds(child));
        });
      }
      return ids;
    };
    const catalogue = cataloguePermissions.find(
      (cat) => cat.id === catalogueId
    );
    if (!catalogue) return { checked: false, indeterminate: false };
    const allChildrenIds = getAllChildrenIds(catalogue);
    if (allChildrenIds.length === 0)
      return {
        checked: checkedKeys.includes(catalogueId),
        indeterminate: false,
      };
    const checkedChildrenCount = allChildrenIds.filter((id) =>
      checkedKeys.includes(id)
    ).length;
    const catalogueChecked = checkedKeys.includes(catalogueId);
    if (catalogueChecked || checkedChildrenCount === allChildrenIds.length) {
      return { checked: true, indeterminate: false };
    } else if (checkedChildrenCount > 0) {
      return { checked: false, indeterminate: true };
    } else {
      return { checked: false, indeterminate: false };
    }
  };

  // 处理目录权限选择（完整支持多层嵌套）
  const handleCatalogueCheck = (catalogueId: string, checked: boolean) => {
    const newCheckedKeys = new Set(checkedKeys);
    // 递归查找权限及其所有子权限
    const findPermissionAndChildren = (
      permission: Permission
    ): Permission[] => {
      let result = [permission];
      if (permission.children && permission.children.length > 0) {
        permission.children.forEach((child) => {
          result = result.concat(findPermissionAndChildren(child));
        });
      }
      return result;
    };
    const catalogue = cataloguePermissions.find(
      (cat) => cat.id === catalogueId
    );
    if (catalogue) {
      const allPermissions = findPermissionAndChildren(catalogue);
      allPermissions.forEach((permission) => {
        if (checked) {
          newCheckedKeys.add(permission.id);
        } else {
          newCheckedKeys.delete(permission.id);
        }
      });
    }
    setCheckedKeys(Array.from(newCheckedKeys));
  };

  // 处理菜单权限选择
  const handleMenuCheck = (menuId: string, checked: boolean) => {
    const newCheckedKeys = new Set(checkedKeys);

    if (checked) {
      newCheckedKeys.add(menuId);
    } else {
      newCheckedKeys.delete(menuId);
    }

    setCheckedKeys(Array.from(newCheckedKeys));
  };

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
    <Modal
      title={`配置角色权限 - ${role.name}`}
      open={show}
      onCancel={onCancel}
      width={1000}
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
        <div className="mb-4 text-gray-600 text-sm">
          <p className="mb-1">
            🎯 勾选目录权限会自动选中其下所有菜单，也可以单独调整每个菜单权限
          </p>
        </div>

        {/* 表格式权限配置 */}
        <div
          className="border rounded-lg overflow-hidden"
          style={{ minHeight: 450 }}
        >
          {/* 表头 */}
          <div className="bg-gray-50 border-b flex">
            <div className="w-2/5 px-4 py-3 font-medium text-gray-700 border-r">
              <Iconify icon="folder" className="mr-2 inline" />
              目录权限 (CATALOGUE)
            </div>
            <div className="flex-1 px-4 py-3 font-medium text-gray-700">
              <Iconify icon="menu" className="mr-2 inline" />
              菜单权限 (MENU)
            </div>
          </div>

          {/* 权限列表 */}
          <div className="max-h-96 overflow-y-auto">
            {cataloguePermissions.map((catalogue, index) => {
              const categoryData = menusByCategory[catalogue.id];
              const checkState = getCatalogueCheckState(catalogue.id);
              const hasMenus = categoryData && categoryData.menus.length > 0;
              const menuCount = hasMenus ? categoryData.menus.length : 0;

              return (
                <div
                  key={catalogue.id}
                  className={`flex border-b hover:bg-gray-25 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  {/* 左侧：目录权限 */}
                  <div className="w-2/5 border-r">
                    <div className="p-4">
                      <div className="flex items-start">
                        <Checkbox
                          checked={checkState.checked}
                          indeterminate={checkState.indeterminate}
                          onChange={(e) =>
                            handleCatalogueCheck(catalogue.id, e.target.checked)
                          }
                          className="mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            {catalogue.icon && (
                              <Iconify
                                icon={catalogue.icon}
                                size={18}
                                className="mr-2 text-blue-600"
                              />
                            )}
                            <span className="font-medium text-gray-800">
                              {catalogue.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {catalogue.label}
                          </div>

                          {/* 统计信息 */}
                          <div className="mt-2 space-y-1">
                            <div className="text-xs text-blue-600">
                              {menuCount > 0
                                ? `📋 ${menuCount} 个菜单`
                                : "📋 暂无菜单"}
                            </div>

                            {/* 嵌套子目录统计 */}
                            {(() => {
                              const getNestedCatalogueCount = (
                                permission: Permission
                              ): number => {
                                let count = 0;
                                if (permission.children) {
                                  permission.children.forEach((child) => {
                                    if (
                                      child.type === PermissionType.CATALOGUE
                                    ) {
                                      count++;
                                      count += getNestedCatalogueCount(child);
                                    }
                                  });
                                }
                                return count;
                              };

                              const nestedCount =
                                getNestedCatalogueCount(catalogue);
                              return (
                                nestedCount > 0 && (
                                  <div className="text-xs text-purple-600">
                                    📁 {nestedCount} 个子目录
                                  </div>
                                )
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：菜单权限 */}
                  <div className="flex-1">
                    {hasMenus ? (
                      <div className="p-4">
                        <div className="grid gap-3">
                          {categoryData.menus.map((menu) => {
                            // 根据parentId判断菜单的层级深度
                            const getMenuDepth = (
                              menuItem: Permission,
                              catalogue: Permission,
                              depth = 0
                            ): number => {
                              // 如果菜单的父级是当前目录，深度为0
                              if (menuItem.parentId === catalogue.id) {
                                return depth;
                              }

                              // 递归查找父级目录
                              const findParentInCatalogue = (
                                current: Permission,
                                targetParentId: string
                              ): Permission | null => {
                                if (current.id === targetParentId) {
                                  return current;
                                }
                                if (current.children) {
                                  for (const child of current.children) {
                                    const found = findParentInCatalogue(
                                      child,
                                      targetParentId
                                    );
                                    if (found) return found;
                                  }
                                }
                                return null;
                              };

                              const parent = findParentInCatalogue(
                                catalogue,
                                menuItem.parentId || ""
                              );
                              if (!parent) {
                                return depth;
                              }

                              return getMenuDepth(parent, catalogue, depth + 1);
                            };

                            const menuDepth = getMenuDepth(menu, catalogue);
                            const isNestedMenu = menuDepth > 0;

                            // 获取菜单的完整路径用于显示
                            const getMenuPath = (
                              menuItem: Permission
                            ): string => {
                              const path: string[] = [];

                              const findPath = (
                                current: Permission,
                                targetId: string
                              ): boolean => {
                                if (current.id === targetId) {
                                  return true;
                                }
                                if (current.children) {
                                  for (const child of current.children) {
                                    if (findPath(child, targetId)) {
                                      path.unshift(current.name);
                                      return true;
                                    }
                                  }
                                }
                                return false;
                              };

                              findPath(catalogue, menuItem.id);
                              return path.length > 0 ? path.join(" > ") : "";
                            };

                            const menuPath = getMenuPath(menu);

                            return (
                              <div
                                key={menu.id}
                                className={`relative flex items-start p-3 rounded-lg transition-all duration-200 ${
                                  checkedKeys.includes(menu.id)
                                    ? "bg-blue-50 border border-blue-200 shadow-sm"
                                    : "hover:bg-gray-50 border border-gray-200"
                                } ${
                                  isNestedMenu
                                    ? "ml-6 border-l-4 border-l-blue-300"
                                    : ""
                                }`}
                              >
                                {/* 层级指示器 */}
                                {isNestedMenu && (
                                  <div className="absolute -left-6 top-0 bottom-0 flex items-center">
                                    <div className="w-6 h-px bg-blue-300"></div>
                                  </div>
                                )}

                                <Checkbox
                                  checked={checkedKeys.includes(menu.id)}
                                  onChange={(e) =>
                                    handleMenuCheck(menu.id, e.target.checked)
                                  }
                                  className="mt-1"
                                />

                                <div className="ml-3 flex-1 min-w-0">
                                  <div className="flex items-center flex-wrap gap-2">
                                    {menu.icon && (
                                      <Iconify
                                        icon={menu.icon}
                                        size={16}
                                        className="text-gray-600 flex-shrink-0"
                                      />
                                    )}
                                    <span className="text-gray-800 font-medium truncate">
                                      {menu.name}
                                    </span>

                                    {/* 标签区域 */}
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {menu.label}
                                      </span>

                                      {isNestedMenu && (
                                        <span className="text-xs text-white bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-0.5 rounded-full font-medium">
                                          L{menuDepth + 1}级菜单
                                        </span>
                                      )}

                                      {menu.hide && (
                                        <span className="text-xs text-white bg-red-500 px-2 py-0.5 rounded-full">
                                          隐藏
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {/* 路由信息 */}
                                  {menu.route && (
                                    <div className="mt-1 text-xs text-blue-600 flex items-center">
                                      <Iconify
                                        icon="material-symbols:link"
                                        className="mr-1"
                                        size={12}
                                      />
                                      <span className="font-mono bg-blue-50 px-1 rounded text-blue-700">
                                        /{menu.route}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 flex items-center justify-center text-gray-400 text-sm">
                        <Iconify icon="tabler:folder-x" className="mr-2" />
                        暂无菜单权限
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {cataloguePermissions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Iconify
                  icon="tabler:database-x"
                  size={32}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p>暂无权限数据</p>
              </div>
            )}
          </div>
        </div>

        {/* 选中权限统计 */}
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              已选择权限：
              <span className="ml-2 font-medium text-blue-600">
                {checkedKeys.length} 项
              </span>
            </div>
            <div className="text-xs text-gray-500">
              目录:{" "}
              {(() => {
                const allPermissions: Permission[] = [];
                const collectAll = (perms: Permission[]) => {
                  perms.forEach((p) => {
                    allPermissions.push(p);
                    if (p.children) collectAll(p.children);
                  });
                };
                collectAll(permissions);
                return checkedKeys.filter((key) =>
                  allPermissions.some(
                    (p) => p.id === key && p.type === PermissionType.CATALOGUE
                  )
                ).length;
              })()}{" "}
              项 | 菜单:{" "}
              {(() => {
                const allPermissions: Permission[] = [];
                const collectAll = (perms: Permission[]) => {
                  perms.forEach((p) => {
                    allPermissions.push(p);
                    if (p.children) collectAll(p.children);
                  });
                };
                collectAll(permissions);
                return checkedKeys.filter((key) =>
                  allPermissions.some(
                    (p) => p.id === key && p.type === PermissionType.MENU
                  )
                ).length;
              })()}{" "}
              项 | 按钮:{" "}
              {(() => {
                const allPermissions: Permission[] = [];
                const collectAll = (perms: Permission[]) => {
                  perms.forEach((p) => {
                    allPermissions.push(p);
                    if (p.children) collectAll(p.children);
                  });
                };
                collectAll(permissions);
                return checkedKeys.filter((key) =>
                  allPermissions.some(
                    (p) => p.id === key && p.type === PermissionType.BUTTON
                  )
                ).length;
              })()}{" "}
              项
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
}
