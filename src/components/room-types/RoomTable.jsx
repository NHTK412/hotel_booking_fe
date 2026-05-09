import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Modal, notification, Spin, Table, Tag } from "antd";
import { useState } from "react";
import { createMultipleRooms, updateStatusRoom } from "../../services/RoomService";
const RoomTable = ({
    currentRoomType,
    listRoom,
    setListRoom,
    fetchRoomTypeDetail
}) => {

    const statusRoom = [
        {
            value: "ACTIVE",
            label: "Hoạt động",
            color: "green"
        },
        {
            value: "DELETED",
            label: "Đã xóa",
            color: "red"
        },
        {
            value: "INACTIVE",
            label: "Không hoạt động",
            color: "yellow"
        }
    ]

    const columns = [
        {
            title: "Mã phòng",
            dataIndex: "roomId",
            key: "roomId",
            width: "25%",
            render: (text) => <span className="font-semibold text-gray-900">#{text}</span>
        },
        {
            title: "Số phòng",
            dataIndex: "roomNumber",
            key: "roomNumber",
            width: "25%",
            render: (text) => <span className="font-medium text-gray-800">{text}</span>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: "25%",
            render: (status) => {
                const statusConfig = statusRoom.find((s) => s.value === status);
                return (
                    <Tag color={statusConfig?.color} className="text-xs">
                        {statusConfig?.label}
                    </Tag>
                );
            }
        },
        {
            title: "Hành động",
            key: "action",
            width: "25%",
            render: (_, record) =>
                <>
                    {
                        record.status === "ACTIVE" ? (
                            <>
                                <Button color="default" variant="filled" onClick={() => handleUpdateStatusRoom(record.roomId, "INACTIVE")}>
                                    Bảo trì
                                </Button>
                                <Button color="danger" variant="filled" className="ml-2" onClick={() => handleUpdateStatusRoom(record.roomId, "DELETED")}>
                                    Xóa
                                </Button>
                            </>)
                            : record.status === "INACTIVE" ? (
                                <>
                                    <Button color="danger" variant="filled" onClick={() => handleUpdateStatusRoom(record.roomId, "DELETED")}>
                                        Xóa
                                    </Button>
                                    <Button color="primary" variant="filled" className="ml-2" onClick={() => handleUpdateStatusRoom(record.roomId, "ACTIVE")}>
                                        Khôi phục
                                    </Button>
                                </>
                            ) : (
                                <Button color="primary" variant="filled" onClick={() => handleUpdateStatusRoom(record.roomId, "ACTIVE")}>
                                    Khôi phục
                                </Button>
                            )
                    }
                </>
        }
    ];



    const [isShowModalNewRoom, setIsShowModalNewRoom] = useState(false);
    const [isLoadRoom, setIsLoadRoom] = useState(false);
    const [inputs, setInputs] = useState([""]);


    const handleNewRoom = async () => {
        try {
            setIsLoadRoom(true);
            const data =
            {
                "roomNumbers": inputs
            }
                ;

            const reponse = await createMultipleRooms(currentRoomType.roomtypeId, data);

            notification.success(
                {
                    title: "Thành công",
                    description: "Đã thêm phòng mới thành công.",
                }
            )
            // console.log("Thêm phòng mới thành công: ", reponse);

            setIsShowModalNewRoom(false);
            setInputs([""]);
            fetchRoomTypeDetail(currentRoomType.roomtypeId);
        } catch (error) {
            notification.error(
                {
                    title: "Lỗi",
                    description: "Đã có lỗi xảy ra khi thêm phòng mới. Vui lòng thử lại sau.",
                }
            )
        }
        finally {
            setIsLoadRoom(false);
        }
    }

    const handleDeleteInput = (index) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs);
    }

    const handleChange = (value, index) => {
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
    }

    const handleUpdateStatusRoom = async (roomId, status) => {
        try {
            setIsLoadRoom(true);
            await updateStatusRoom(currentRoomType.roomtypeId, roomId, status);
            notification.success(
                {
                    title: "Thành công",
                    description: "Cập nhật trạng thái phòng thành công.",
                }
            )
            fetchRoomTypeDetail(currentRoomType.roomtypeId);
        } catch (error) {
            notification.error(
                {
                    title: "Lỗi",
                    description: "Đã có lỗi xảy ra khi cập nhật trạng thái phòng. Vui lòng thử lại sau.",
                }
            )
        }
        finally {
            setIsLoadRoom(false);
        }
    }



    return (
        <>
            <Spin spinning={isLoadRoom} >
                <div className="flex flex-row justify-between">
                    <h3 className="text-xl font-semibold mb-4">Danh sách phòng thuộc loại phòng</h3>
                    <Button type="primary" onClick={() => setIsShowModalNewRoom(true)} loading={isLoadRoom}>
                        Thêm phòng
                    </Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={listRoom}
                    pagination={false}
                    rowKey="roomId"
                >
                </Table>
                <Modal
                    title="Thêm phòng mới"
                    open={isShowModalNewRoom}
                    onCancel={() => {
                        setIsShowModalNewRoom(false);
                        setInputs([""]);
                    }}
                    onOk={() => {
                        if (inputs.some(input => !input.trim())) {
                            notification.error({
                                title: "Lỗi",
                                description: "Vui lòng điền đầy đủ thông tin cho tất cả phòng mới.",
                            });
                            return;
                        }
                        // alert("Thêm phòng mới: " + inputs.join(", "))
                        handleNewRoom();
                    }}
                    okText="Thêm"
                    cancelText="Hủy"
                    styles={{
                        body: {
                            maxHeight: "80vh",
                            overflowY: "auto"
                        },
                    }}
                >
                    <Spin spinning={isLoadRoom}>
                        <div className="flex flex-col space-y-4 mb-5">
                            {
                                inputs.map((item, index) => (
                                    <div className="flex flex-row items-center justify-between space-x-4" key={index}>
                                        <span className=" font-medium text-gray-700">Phòng mới {index + 1}:</span>
                                        <Input
                                            className="flex-1"
                                            key={index}
                                            value={item}
                                            status={!item?.trim() ? "error" : ""}
                                            onChange={(e) =>
                                                handleChange(e.target.value, index)
                                            }
                                        // style={{ width: "80%" }}
                                        />
                                        <Button className="ml-5" color="danger" variant="outlined" onClick={() => handleDeleteInput(index)}>
                                            <DeleteOutlined></DeleteOutlined>
                                        </Button>
                                    </div>

                                ))
                            }
                        </div>

                        <Button onClick={() => setInputs([...inputs, ""])}>
                            Thêm
                        </Button>
                    </Spin>

                </Modal>
            </Spin>
        </>
    )
}

export default RoomTable;