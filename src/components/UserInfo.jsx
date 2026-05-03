import { Avatar, Button, Image, notification, Spin } from "antd";
import { useContext, useEffect, useState } from "react";
import { getUserInfo } from "../services/userService";
import { EditOutlined } from "@ant-design/icons";
import { globalContext } from "../context/GlobalContext";

const UserInfo = () => {


    const { userInfo, isLoading } = useContext(globalContext);

    return (
        <>
            {
                isLoading ?
                    (
                        <div className="flex justify-center items-center h-[83vh]">
                            <Spin size="large" />
                        </div>
                    ) :
                    (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    Thông Tin Người Dùng
                                    <span className="text-xl text-gray-500 ml-2">#{userInfo?.id}</span>
                                </h2>

                                <Button type="primary" icon={<EditOutlined />}>
                                    Chỉnh sửa
                                </Button>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mr-15">
                                    <Image
                                        width={200}
                                        src={userInfo?.avatarUrl}
                                        className="rounded-xl object-cover"
                                    />
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4 text-sm items-center">

                                    <div>
                                        <p className="text-gray-500">Họ và tên</p>
                                        <p className="font-medium">{userInfo?.name}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium">{userInfo?.email}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Giới tính</p>
                                        <p className="font-medium">{userInfo?.gender}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Ngày sinh</p>
                                        <p className="font-medium">
                                            {userInfo?.birthday
                                                ? new Date(userInfo.birthday).toLocaleDateString()
                                                : ""}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Số điện thoại</p>
                                        <p className="font-medium">{userInfo?.phone}</p>
                                    </div>

                                    <div >
                                        <p className="text-gray-500">Địa chỉ</p>
                                        <p className="font-medium">{userInfo?.address}</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )
            }
        </>
    )


}

export default UserInfo;