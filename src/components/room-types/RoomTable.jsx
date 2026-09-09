import { DeleteOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, notification, Spin, Table, Tag, Popconfirm, Space } from "antd";
import { useContext, useState } from "react";
import { createMultipleRooms, deleteMultipleRooms } from "../../services/RoomService";
import { globalContext } from "../../context/GlobalContext";

const RoomTable = ({
    currentRoomType,
    listRoom,
    setListRoom,
    fetchRoomTypeDetail,
}) => {
    const { listHotel, hotelCurrent } = useContext(globalContext);
    const userRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    const isManager =
        listHotel[hotelCurrent]?.staffRole === "ROLE_MANAGER" ||
        listHotel[hotelCurrent]?.staffRole === "ROLE_HOST" ||
        userRole === "HOST";

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isShowModalNewRoom, setIsShowModalNewRoom] = useState(false);
    const [isLoadRoom, setIsLoadRoom] = useState(false);
    const [inputs, setInputs] = useState([""]);

    const handleDeleteRooms = async (roomIds) => {
        if (!roomIds || roomIds.length === 0) return;
        try {
            setIsLoadRoom(true);
            await deleteMultipleRooms(currentRoomType.roomtypeId, roomIds);
            notification.success({
                message: "Thành công",
                description: `Đã xóa ${roomIds.length} phòng thành công.`,
            });
            setSelectedRowKeys([]);
            fetchRoomTypeDetail(currentRoomType.roomtypeId);
        } catch (error) {
            console.error("Lỗi khi xóa phòng:", error);
            notification.error({
                message: "Lỗi",
                description: error?.response?.data?.message || "Đã có lỗi xảy ra khi xóa phòng.",
            });
        } finally {
            setIsLoadRoom(false);
        }
    };

    const handleNewRoom = async () => {
        const validNumbers = inputs.map((num) => num?.trim()).filter(Boolean);
        if (validNumbers.length === 0) {
            notification.warning({
                message: "Thông tin không hợp lệ",
                description: "Vui lòng nhập ít nhất một số phòng.",
            });
            return;
        }

        try {
            setIsLoadRoom(true);
            await createMultipleRooms(currentRoomType.roomtypeId, {
                roomNumbers: validNumbers,
            });

            notification.success({
                message: "Thành công",
                description: `Đã thêm ${validNumbers.length} phòng mới thành công.`,
            });

            setIsShowModalNewRoom(false);
            setInputs([""]);
            fetchRoomTypeDetail(currentRoomType.roomtypeId);
        } catch (error) {
            console.error("Lỗi khi thêm phòng:", error);
            notification.error({
                message: "Lỗi",
                description: error?.response?.data?.message || "Đã có lỗi xảy ra khi thêm phòng mới.",
            });
        } finally {
            setIsLoadRoom(false);
        }
    };

    const handleDeleteInput = (index) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs.length > 0 ? newInputs : [""]);
    };

    const handleChange = (value, index) => {
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
    };

    const columns = [
        {
            title: "Mã phòng",
            dataIndex: "roomId",
            key: "roomId",
            width: 100,
            align: "center",
            render: (text) => (
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    #{text}
                </span>
            ),
        },
        {
            title: "Số phòng",
            dataIndex: "roomNumber",
            key: "roomNumber",
            render: (text) => <span className="font-bold text-slate-800 text-sm">{text}</span>,
        },
        {
            title: "Trạng thái",
            dataIndex: "isDeleted",
            key: "isDeleted",
            width: 150,
            align: "center",
            render: (isDeleted) =>
                isDeleted ? (
                    <Tag icon={<CloseCircleOutlined />} color="error">
                        Đã xóa
                    </Tag>
                ) : (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Đang hoạt động
                    </Tag>
                ),
        },
        ...(isManager
            ? [
                  {
                      title: "Hành động",
                      key: "action",
                      width: 110,
                      align: "center",
                      render: (_, record) => (
                          <Popconfirm
                              title="Xóa phòng này?"
                              description={`Bạn có chắc muốn xóa phòng ${record.roomNumber}?`}
                              onConfirm={() => handleDeleteRooms([record.roomId])}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                          >
                              <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                              >
                                  Xóa
                              </Button>
                          </Popconfirm>
                      ),
                  },
              ]
            : []),
    ];

    const rowSelection = isManager
        ? {
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
          }
        : undefined;

    return (
        <Spin spinning={isLoadRoom}>
            <div className="flex flex-row items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 m-0">
                        Danh sách phòng vật lý
                    </h3>
                    <span className="text-xs text-slate-500">
                        Tổng cộng {listRoom?.length || 0} phòng vật lý gán vào loại phòng này
                    </span>
                </div>
                {isManager && (
                    <Space>
                        {selectedRowKeys.length > 0 && (
                            <Popconfirm
                                title={`Xóa ${selectedRowKeys.length} phòng đã chọn?`}
                                onConfirm={() => handleDeleteRooms(selectedRowKeys)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button danger icon={<DeleteOutlined />}>
                                    Xóa {selectedRowKeys.length} phòng
                                </Button>
                            </Popconfirm>
                        )}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsShowModalNewRoom(true)}
                        >
                            Thêm phòng
                        </Button>
                    </Space>
                )}
            </div>

            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={listRoom || []}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                rowKey="roomId"
                size="small"
            />

            <Modal
                title="Thêm phòng vật lý mới"
                open={isShowModalNewRoom}
                onCancel={() => {
                    setIsShowModalNewRoom(false);
                    setInputs([""]);
                }}
                onOk={handleNewRoom}
                okText="Thêm tất cả"
                cancelText="Hủy"
                destroyOnClose
            >
                <div className="space-y-3 py-2">
                    <p className="text-xs text-slate-500 mb-2">
                        Nhập các số phòng thực tế (Ví dụ: 101, 102, 201...) để tạo hàng loạt vào loại phòng:
                    </p>
                    {inputs.map((item, index) => (
                        <div className="flex items-center gap-2" key={index}>
                            <span className="text-xs font-semibold text-slate-600 w-16">
                                Phòng #{index + 1}:
                            </span>
                            <Input
                                className="flex-1"
                                placeholder={`Ví dụ: ${100 + index + 1}`}
                                value={item}
                                onChange={(e) => handleChange(e.target.value, index)}
                            />
                            {inputs.length > 1 && (
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteInput(index)}
                                />
                            )}
                        </div>
                    ))}

                    <Button
                        type="dashed"
                        block
                        icon={<PlusOutlined />}
                        onClick={() => setInputs([...inputs, ""])}
                    >
                        Thêm ô nhập số phòng
                    </Button>
                </div>
            </Modal>
        </Spin>
    );
};

export default RoomTable;