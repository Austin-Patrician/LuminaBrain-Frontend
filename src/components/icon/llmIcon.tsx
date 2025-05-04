import React, { useState, useEffect } from "react";
import { LLMFactory, IconMap } from "@/constant/llm";

// 预加载所有 SVG 图标文件 (Vite特性)
// 使用相对路径或绝对路径以避免别名解析问题
const iconModules = import.meta.glob("/src/assets/icons/llm/*.svg", { eager: true });

// 创建名称到图标的映射表
const iconCache: Record<string, string> = {};

// 初始化图标缓存
Object.entries(iconModules).forEach(([path, module]) => {
	// 从路径中提取文件名 (去掉扩展名)
	const fileName = path.split("/").pop()?.replace(".svg", "") || "";
	const iconPath = (module as any).default || module;

	// 将文件名作为键，图标路径作为值存入缓存
	iconCache[fileName.toLowerCase()] = typeof iconPath === "string" ? iconPath : "";

	// 记录已加载的图标 (调试用)
	console.log(`已加载图标: ${fileName}`);
});

interface LLMIconProps {
	provider: LLMFactory | string;
	size?: number;
	color?: string;
	style?: React.CSSProperties;
	className?: string;
	fallback?: string;
}

const LLMIcon: React.FC<LLMIconProps> = ({
	provider,
	size = 24,
	color,
	style = {},
	className = "",
	fallback = "default",
}) => {
	const [iconSrc, setIconSrc] = useState<string | null>(null);

	useEffect(() => {
		// 尝试多种命名方式来查找图标
		const tryGetIcon = () => {
			// 获取规范化的图标名称
			const getIconName = (): string => {
				// 1. 如果provider是LLMFactory枚举值，直接从IconMap查找
				if (Object.values(LLMFactory).includes(provider as LLMFactory)) {
					return IconMap[provider as LLMFactory] || fallback;
				}

				// 2. 如果provider是字符串，尝试匹配已有的LLMFactory枚举值
				const matchedFactory = Object.values(LLMFactory).find(
					(factory) => factory.toLowerCase() === (provider as string).toLowerCase(),
				);

				if (matchedFactory) {
					return IconMap[matchedFactory] || fallback;
				}

				// 3. 如果找不到匹配的枚举值，尝试直接使用provider作为图标名称
				return (provider as string).toLowerCase();
			};

			const iconName = getIconName().toLowerCase();

			// 尝试不同的大小写组合
			const variations = [
				iconName,
				iconName.toLowerCase(),
				iconName.charAt(0).toUpperCase() + iconName.slice(1),
				iconName.toUpperCase(),
			];

			// 遍历尝试所有可能的名称变体
			for (const name of variations) {
				if (iconCache[name]) {
					return iconCache[name];
				}
			}

			// 如果没找到，返回默认图标
			console.warn(`未找到图标: ${iconName}，使用默认图标`);
			return iconCache[fallback.toLowerCase()] || "";
		};

		const icon = tryGetIcon();
		setIconSrc(icon || null);
	}, [provider, fallback]);

	// 合并样式
	const iconStyle = {
		width: size,
		height: size,
		fill: color,
		...style,
	};

	// 如果没有找到图标，显示占位符
	if (!iconSrc) {
		return (
			<div
				style={{
					...iconStyle,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#f5f5f5",
					borderRadius: "4px",
					fontSize: size * 0.5,
					color: "#999",
				}}
				className={className}
			>
				?
			</div>
		);
	}

	// 正常渲染图标
	return <img src={iconSrc} alt={`${provider} icon`} style={iconStyle} className={className} />;
};

// 导出可用图标列表供调试使用
export const availableIcons = Object.keys(iconCache);

export default LLMIcon;
