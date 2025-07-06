import { Card, Col, Descriptions, Row, Tag, Spin, message } from "antd";
import { useParams } from "react-router";
import { useEffect, useState } from "react";

import { IconButton, Iconify } from "@/components/icon";
import userService from "@/api/services/userService";

import type { UserInfo } from "#/entity";
import { BasicStatus } from "#/enum";

export default function UserDetailPage() {
	const { id } = useParams();
	const [user, setUser] = useState<UserInfo | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchUser = async () => {
			if (!id) return;
			
			setLoading(true);
			try {
				const response = await userService.findById(id);
				setUser(response);
			} catch (error) {
				console.error("Failed to fetch user:", error);
				message.error("Failed to load user details");
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [id]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Spin size="large" />
			</div>
		);
	}

	if (!user) {
		return (
			<Card>
				<div className="text-center text-gray-500">User not found</div>
			</Card>
		);
	}

	return (
		<Row gutter={[16, 16]}>
			<Col span={24}>
				<Card
					title="User Details"
					extra={
						<div>
							<IconButton>
								<Iconify icon="solar:pen-bold-duotone" size={18} />
							</IconButton>
							<IconButton>
								<Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
							</IconButton>
						</div>
					}
				>
					<div className="flex">
						<img alt="" src={user.avatar} className="h-20 w-20 rounded-full" />
						<div className="ml-4 flex flex-col justify-center">
							<h2 className="text-xl font-semibold">{user.userName}</h2>
							<p className="text-gray-500">{user.email}</p>
						</div>
					</div>

					<Descriptions bordered className="mt-6" column={2}>
						<Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
						<Descriptions.Item label="Username">{user.userName}</Descriptions.Item>
						<Descriptions.Item label="Email">{user.email}</Descriptions.Item>
						<Descriptions.Item label="Role">
							<Tag color="blue">{user.role?.name}</Tag>
						</Descriptions.Item>
						<Descriptions.Item label="Status">
							<Tag color={user.status === BasicStatus.ENABLE ? "green" : "red"}>
								{user.status === BasicStatus.ENABLE ? "Active" : "Inactive"}
							</Tag>
						</Descriptions.Item>
					</Descriptions>
				</Card>
			</Col>
		</Row>
	);
}
