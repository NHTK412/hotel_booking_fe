import { Avatar, Button, Image, notification, Spin } from "antd";
import { useContext, useEffect, useState } from "react";
import { getUserInfo } from "../services/userService";
import { EditOutlined } from "@ant-design/icons";
import { globalContext } from "../context/GlobalContext";

const HotelInfo = () => {

    const { listHotel, hotelCurrent, isLoading } = useContext(globalContext);

    const isManager = listHotel[hotelCurrent]?.staffRole === "ROLE_MANAGER";

    const hotel = listHotel[hotelCurrent];
    // {
    //     {
    //         "accommodationId": 3,
    //             "accommodationName": "Khách Sạn Thiên Minh",
    //                 "address": "168 Nguyễn Gia Trí",
    //                     "averageRating": 3,
    //                         "discountMinPricePerNight": 20,
    //                             "image": "accommodation-image.png",
    //                                 "lat": 10.8058,
    //                                     "lng": 106.718,
    //                                         "minPricePerNight": 100000,
    //                                             "type": "Khách sạn"
    //     }
    // }

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
                            <div className="flex flex-row justify-between">
                                <h2 className="text-xl font-semibold">
                                    Thông Tin Khách Sạn
                                    <span className="text-xl text-gray-500 ml-2">
                                        #{hotel?.accommodationId}
                                    </span>
                                </h2>
                                {isManager && (
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        className="ml-4"
                                        onClick={() => notification.info({ message: "Chức năng đang được phát triển" })}
                                    >
                                        Chỉnh Sửa
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mr-15">
                                    <Image
                                        width={200}
                                        src={hotel?.image}
                                        className="rounded-xl object-cover"
                                    />
                                </div>

                                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4 text-sm items-center">

                                    <div>
                                        <p className="text-gray-500">Tên khách sạn</p>
                                        <p className="font-medium">{hotel?.accommodationName}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Loại</p>
                                        <p className="font-medium">{hotel?.type}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Địa chỉ</p>
                                        <p className="font-medium">{hotel?.address}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Đánh giá trung bình</p>
                                        <p className="font-medium">{hotel?.averageRating}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Giá thấp nhất</p>
                                        <p className="font-medium">
                                            {hotel?.minPricePerNight?.toLocaleString()} VND
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Giá sau giảm</p>
                                        <p className="font-medium">
                                            {hotel?.discountMinPricePerNight?.toLocaleString()} VND
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Latitude</p>
                                        <p className="font-medium">{hotel?.lat}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Longitude</p>
                                        <p className="font-medium">{hotel?.lng}</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )
            }
        </>
    )
}

export default HotelInfo;