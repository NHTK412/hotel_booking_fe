import { useState, useContext } from "react";
import { Button, Modal, Tag } from "antd";
import { PlusOutlined, AppstoreAddOutlined, ReloadOutlined } from "@ant-design/icons";
import NewRoomType from "./NewRoomType";
import { globalContext } from "../../context/GlobalContext";

const HeaderListRoom = ({ fetchRoomTypes, isLoading }) => {
    const [isShowModalNewRoomType, setIsShowModalNewRoomType] = useState(false);
    const { listHotel, hotelCurrent, selectedAccommodationId, currentHotel, role , activeRole} = useContext(globalContext);
    const userRole = role || localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    // const isManager =
    //     userRole === "ROLE_HOST" ||
    //     userRole === "HOST" ||
    //     userRole === "ROLE_ADMIN" ||
    //     userRole === "ROLE_MANAGER" ||
    //     currentHotel?.staffRole === "ROLE_MANAGER" ||
    //     currentHotel?.staffRole === "ROLE_HOST";

    const isManager = activeRole === "ROLE_MANAGER";

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-800 m-0">
                        Danh Mục Loại Phòng & Giá
                    </h1>
                    {/* {currentHotel ? (
                        <Tag color="blue" className="font-semibold text-xs m-0">
                            #{currentHotel.accommodationId} - {currentHotel.accommodationName}
                        </Tag>
                    ) : (
                        <Tag color="geekblue" className="font-semibold text-xs m-0">
                            Tất Cả Cơ Sở ({listHotel?.length || 0})
                        </Tag>
                    )} */}
                </div>
                {/* <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Quản lý các loại phòng nghỉ, chính sách giá niêm yết, ưu đãi giảm giá và tiện nghi phòng.
                </p> */}
            </div>

            <div className="flex items-center gap-3">
                <Button
                    icon={<ReloadOutlined spin={isLoading} />}
                    onClick={fetchRoomTypes}
                >
                    Làm mới
                </Button>

                {isManager && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsShowModalNewRoomType(true)}
                    >
                        Thêm Loại Phòng
                    </Button>
                )}
            </div>

            <Modal
                footer={null}
                title={
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <AppstoreAddOutlined className="text-blue-600 text-lg" />
                        <div>
                            <span className="text-base font-bold text-slate-800">
                                Thêm Loại Phòng Mới
                            </span>

                        </div>
                    </div>
                }
                open={isShowModalNewRoomType}
                onCancel={() => setIsShowModalNewRoomType(false)}
                width={960}
                centered
                destroyOnClose
            >
                <NewRoomType
                    fetchRoomTypes={fetchRoomTypes}
                    setIsShowModalNewRoomType={setIsShowModalNewRoomType}
                />
            </Modal>
        </div>
    );
};

export default HeaderListRoom;