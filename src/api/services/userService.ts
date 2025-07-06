import apiClient from "../apiClient";

import type { UserInfo, UserToken } from "#/entity";

export interface SignInReq {
	username: string;
	password: string;
}

export interface SignUpReq extends SignInReq {
	email: string;
}

export interface UserPageReq {
	userName?: string | null;
	pageNumber: number;
	pageSize: number;
}

export interface UserPageRes {
	total: number;
	data: UserInfo[];
}

export type SignInRes = UserToken & { user: UserInfo };

export enum UserApi {
	SignIn = "/users/login",
	SignUp = "/auth/signup",
	Logout = "/auth/logout",
	Refresh = "/auth/refresh",
	User = "/user",
	Users = "/users",
	UsersPage = "/users/page",
}

const signin = (data: SignInReq) =>
	apiClient.post<SignInRes>({ url: UserApi.SignIn, data });
const signup = (data: SignUpReq) =>
	apiClient.post<SignInRes>({ url: UserApi.SignUp, data });
const logout = () => apiClient.get({ url: UserApi.Logout });
const findById = (id: string) =>
	apiClient.get<UserInfo>({ url: `${UserApi.User}/${id}` });
const getUsers = () =>
	apiClient.get<UserInfo[]>({ url: UserApi.Users });
const getUsersPage = (params: UserPageReq) =>
	apiClient.post<UserPageRes>({ url: UserApi.UsersPage, data: params });

export default {
	signin,
	signup,
	findById,
	getUsers,
	getUsersPage,
	logout,
};
