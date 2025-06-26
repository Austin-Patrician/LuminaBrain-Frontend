import { Button, Card, Col, Descriptions, Row, Tag } from "antd";
import { useParams } from "react-router";

import { IconButton, Iconify } from "@/components/icon";

import type { UserInfo } from "#/entity";
import { BasicStatus } from "#/enum";

// Mock user data for demonstration - replace with real API calls
const mockUser: UserInfo = {
	id: "1",
	username: "admin",
	email: "admin@example.com",
	avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
	status: BasicStatus.ENABLE,
	role: {
		id: "1",
		name: "Admin",
		label: "admin",
		status: BasicStatus.ENABLE,
	},
};

export default function UserDetailPage() {
	const { id } = useParams();
	// In a real app, you would fetch user data based on the ID
	const user = mockUser;

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
							<h2 className="text-xl font-semibold">{user.username}</h2>
							<p className="text-gray-500">{user.email}</p>
						</div>
					</div>

					<Descriptions bordered className="mt-6" column={2}>
						<Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
						<Descriptions.Item label="Username">{user.username}</Descriptions.Item>
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
