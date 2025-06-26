import { faker } from "@faker-js/faker";
import { Avatar, Button, Col, Progress, Row } from "antd";
import dayjs from "dayjs";

import Card from "@/components/card";
import { Iconify } from "@/components/icon";

// Generate fake avatars locally
const generateFakeAvatars = (count: number) => {
	return Array.from({ length: count }, () => faker.image.avatarGitHub());
};

export default function ProjectsTab() {
	const items = [
		{
			name: "Technology behind the Blockchain",
			desc: "Progressively incentivize cooperative systems through technically sound functionalities. Authoritatively pontificate.",
			cover: faker.image.urlLoremFlickr({ category: "technics" }),
			avatar: faker.image.avatarGitHub(),
			members: generateFakeAvatars(5),
			updatedAt: dayjs(faker.date.recent()).fromNow(),
			progress: faker.number.int({ min: 20, max: 100 }),
		},
		{
			name: "Admin Template",
			desc: "Time is our most valuable asset, that is why we want to help you save it by creating…",
			cover: faker.image.urlLoremFlickr({ category: "technics" }),
			avatar: faker.image.avatarGitHub(),
			members: generateFakeAvatars(15),
			updatedAt: dayjs(faker.date.recent()).fromNow(),
			progress: faker.number.int({ min: 20, max: 100 }),
		},
		{
			name: "App Design",
			desc: "App design combines the user interface (UI) and user experience (UX).  ",
			cover: faker.image.urlLoremFlickr({ category: "technics" }),
			avatar: faker.image.avatarGitHub(),
			members: generateFakeAvatars(27),
			updatedAt: dayjs(faker.date.recent()).fromNow(),
			progress: faker.number.int({ min: 20, max: 100 }),
		},
		{
			name: "Figma Dashboard",
			desc: "Use this template to organize your design project. Some of the key features are… ",
			cover: faker.image.urlLoremFlickr({ category: "technics" }),
			avatar: faker.image.avatarGitHub(),
			members: generateFakeAvatars(32),
			updatedAt: dayjs(faker.date.recent()).fromNow(),
			progress: faker.number.int({ min: 20, max: 100 }),
		},
		{
			name: "Create Website",
			desc: "Your domain name should reflect your products or services so that your...  ",
			cover: faker.image.urlLoremFlickr({ category: "technics" }),
			avatar: faker.image.avatarGitHub(),
			members: generateFakeAvatars(221),
			updatedAt: dayjs(faker.date.recent()).fromNow(),
			progress: faker.number.int({ min: 20, max: 100 }),
		},
		{
			name: "Logo Design",
			desc: "Premium logo designs created by top logo designers. Create the branding of business.  ",
			cover: faker.image.urlLoremFlickr({ category: "technics" }),
			avatar: faker.image.avatarGitHub(),
			members: generateFakeAvatars(125),
			updatedAt: dayjs(faker.date.recent()).fromNow(),
			progress: faker.number.int({ min: 20, max: 100 }),
		},
	];
	return (
		<Row gutter={[16, 16]}>
			{items.map((item) => (
				<Col span={24} md={12} key={item.name}>
					<Card className="w-full flex-col">
						<header className="flex w-full items-center">
							<Iconify icon="logos:react" size={40} />

							<div className="flex flex-col">
								<span className="ml-4 text-xl opacity-70">{item.name}</span>
								<span className="text-md ml-4 opacity-50">
									Client: {item.client}
								</span>
							</div>

							<div className="ml-auto flex opacity-70">
								<Button
									shape="circle"
									icon={<Iconify icon="fontisto:more-v-a" size={18} />}
								/>
							</div>
						</header>

						<main className="mt-4 w-full">
							<div className="my-2 flex justify-between">
								<span>
									Start Date:
									<span className="ml-2 opacity-50">
										{item.startDate.format("DD/MM/YYYY")}
									</span>
								</span>

								<span>
									Deadline:
									<span className="ml-2 opacity-50">
										{item.deadline.format("DD/MM/YYYY")}
									</span>
								</span>
							</div>
							<span className="opacity-70">{item.desc}</span>
						</main>

						<div className="flex w-full flex-col">
							<div className="mb-4 flex w-full justify-between">
								<span>
									All Hours:
									<span className="ml-2 opacity-50">{item.allHours}</span>
								</span>

								<Tag color="warning">
									{item.deadline.diff(dayjs(), "day")} days left
								</Tag>
							</div>
							<div className="flex w-full ">
								<Avatar.Group max={{ count: 4 }}>
									{item.members.map((memberAvatar) => (
										<Avatar src={memberAvatar} key={memberAvatar} />
									))}
								</Avatar.Group>
								<div className="ml-auto flex items-center opacity-50">
									<Iconify icon="solar:chat-round-line-linear" size={24} />
									<span className="ml-2">{item.messages}</span>
								</div>
							</div>
						</div>
					</Card>
				</Col>
			))}
		</Row>
	);
}
