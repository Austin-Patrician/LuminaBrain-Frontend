export interface Result<T = any> {
	success: boolean;
	statusCode: number;
	message: string;
	data?: T;
}

// 兼容旧版本的API返回格式
export interface LegacyResult<T = any> {
	status: number;
	message: string;
	data?: T;
}
