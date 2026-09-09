import {
    PlusOutlined,
    EditOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ApartmentOutlined,
    LockOutlined,
    UnlockOutlined,
    DeleteOutlined,
    RollbackOutlined,
} from "@ant-design/icons";
import {
    Button,
    Input,
    Modal,
    notification,
    Spin,
    Table,
    Tag,
    Popconfirm,
    Space,
    Tooltip,
    Select,
    Radio,
} from "antd";
import { useContext, useState, useEffect, useCallback } from "react";
import {
    createMultipleRooms,
    updatePhysicalRoom,
    deleteMultipleRooms,
    restorePhysicalRooms,
    getListRoomByRoomTypeId,
} from "../../services/RoomService";
import { globalContext } from "../../context/GlobalContext";

const RoomTable = ({
    currentRoomType,
    listRoom,
    setListRoom,
    fetchRoomTypeDetail,
}) => {
    const { listHotel, hotelCurrent, role , activeRole} = useContext(globalContext);
    const userRole = role || localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    // const isManager =
    //     userRole === "ROLE_HOST" ||
    //     userRole === "HOST" ||
    //     userRole === "ROLE_ADMIN" ||
    //     userRole === "ROLE_MANAGER" ||
    //     listHotel[hotelCurrent]?.staffRole === "ROLE_MANAGER" ||
    //     listHotel[hotelCurrent]?.staffRole === "ROLE_HOST";

    const isManager = activeRole === "ROLE_MANAGER";

    const [isShowModalNewRoom, setIsShowModalNewRoom] = useState(false);
    const [isLoadRoom, setIsLoadRoom] = useState(false);
    const [inputs, setInputs] = useState([""]);
    const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL", "ACTIVE", "INACTIVE", "DELETED"
    const [deletedRooms, setDeletedRooms] = useState([]);

    // State cho việc cập nhật phòng vật lý
    const [editingRoom, setEditingRoom] = useState(null);
    const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);

    // Lấy danh sách phòng đã xóa (thùng rác)
    const fetchDeletedRooms = useCallback(async () => {
        if (!currentRoomType?.roomtypeId) return;
        try {
            const res = await getListRoomByRoomTypeId(currentRoomType.roomtypeId, true);
            const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
            setDeletedRooms(data);
        } catch (err) {
            console.error("Lỗi lấy danh sách phòng đã xóa:", err);
        }
    }, [currentRoomType?.roomtypeId]);

    useEffect(() => {
        fetchDeletedRooms();
    }, [fetchDeletedRooms]);

    // Lọc danh sách phòng còn tồn tại (bỏ qua nếu BE có đánh dấu isDeleted)
    const validRooms = (listRoom || []).filter((r) => !r.isDeleted);
    const countActive = validRooms.filter((r) => r.status !== "INACTIVE").length;
    const countLocked = validRooms.filter((r) => r.status === "INACTIVE").length;

    const displayRooms = statusFilter === "DELETED"
        ? deletedRooms
        : validRooms.filter((r) => {
            if (statusFilter === "ACTIVE") return r.status !== "INACTIVE";
            if (statusFilter === "INACTIVE") return r.status === "INACTIVE";
            return true; // "ALL"
        });

    const handleToggleStatus = async (record) => {
        const nextStatus = record.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
        try {
            setIsLoadRoom(true);
            await updatePhysicalRoom(currentRoomType.roomtypeId, record.roomId, {
                roomNumber: record.roomNumber,
                status: nextStatus,
            });
            notification.success({
                message: "Thành công",
                description:
                    nextStatus === "INACTIVE"
                        ? `Đã khóa phòng "${record.roomNumber}". Khách sẽ không thể đặt phòng này.`
                        : `Đã mở khóa phòng "${record.roomNumber}". Phòng đã sẵn sàng nhận khách.`,
            });
            fetchRoomTypeDetail(currentRoomType.roomtypeId);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái phòng:", error);
            notification.error({
                message: "Cập nhật thất bại",
                description: error?.response?.data?.message || "Không thể cập nhật trạng thái phòng.",
            });
        } finally {
            setIsLoadRoom(false);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            setIsLoadRoom(true);
            await deleteMultipleRooms(currentRoomType.roomtypeId, [roomId]);
            notification.success({
                message: "Thành công",
                description: "Đã chuyển phòng vật lý vào thùng rác.",
            });
            fetchRoomTypeDetail(currentRoomType.roomtypeId);
            fetchDeletedRooms();
        } catch (error) {
            console.error("Lỗi khi xóa phòng:", error);
            notification.error({
                message: "Xóa phòng thất bại",
                description: error?.response?.data?.message || "Không thể xóa phòng.",
            });
        } finally {
            setIsLoadRoom(false);
        }
    };

    const handleRestoreRoom = async (roomId) => {
        try {
            setIsLoadRoom(true);
            await restorePhysicalRooms(currentRoomType.roomtypeId, [roomId]);
            notification.success({
                message: "Thành công",
                description: "Đã khôi phục phòng vật lý thành công.",
            });
            fetchRoomTypeDetail(currentRoomType.roomtypeId);
            fetchDeletedRooms();
        } catch (error) {
            console.error("Lỗi khi khôi phục phòng:", error);
            notification.error({
                message: "Khôi phục thất bại",
                description: error?.response?.data?.message || "Không thể khôi phục phòng.",
            });
        } finally {
            setIsLoadRoom(false);
        }
    };


    const handleNewRoom = async () => {
        // Tách các số phòng từ các ô input (hỗ trợ nhập đơn hoặc nhập chuỗi cách nhau bằng dấu phẩy)
        const rawNumbers = inputs.flatMap((num) =>
            (num || "").split(/[,;\n\s]+/).map((s) => s.trim()).filter(Boolean)
        );

        // Lọc trùng lặp trong dữ liệu nhập
        const uniqueNewNumbers = [...new Set(rawNumbers)];

        if (uniqueNewNumbers.length === 0) {
            notification.warning({
                message: "Thông tin không hợp lệ",
                description: "Vui lòng nhập ít nhất một số phòng hợp lệ.",
            });
            return;
        }

        // Kiểm tra trùng với các phòng chưa xóa hiện tại
        const existingSet = new Set(
            validRooms.map((r) => r.roomNumber?.trim().toLowerCase())
        );
        const duplicates = uniqueNewNumbers.filter((num) => existingSet.has(num.toLowerCase()));
        if (duplicates.length > 0) {
            notification.warning({
                message: "Số phòng đã tồn tại",
                description: `Các số phòng sau đã tồn tại trong loại phòng này: ${duplicates.join(", ")}`,
            });
            return;
        }

        try {
            setIsLoadRoom(true);
            await createMultipleRooms(currentRoomType.roomtypeId, {
                roomNumbers: uniqueNewNumbers,
            });

            notification.success({
                message: "Thành công",
                description: `Đã thêm ${uniqueNewNumbers.length} phòng mới thành công (${uniqueNewNumbers.join(", ")}).`,
            });

            setIsShowModalNewRoom(false);
            setInputs([""]);
            fetchRoomTypeDetail(currentRoomType.roomtypeId);
        } catch (error) {
            console.error("Lỗi khi thêm phòng:", error);
            notification.error({
                message: error?.response?.status === 409 ? "Trùng lặp số phòng" : "Lỗi khi thêm phòng",
                description: error?.response?.data?.message || "Đã có lỗi xảy ra khi thêm phòng mới.",
            });
        } finally {
            setIsLoadRoom(false);
        }
    };

    const handleOpenEditModal = (record) => {
        setEditingRoom({
            roomId: record.roomId,
            roomNumber: record.roomNumber,
            status: record.status || "ACTIVE",
        });
    };

    const handleSaveEditRoom = async () => {
        if (!editingRoom) return;
        const newNumber = editingRoom.roomNumber?.trim();
        if (!newNumber) {
            notification.warning({
                message: "Thông tin không hợp lệ",
                description: "Số phòng không được để trống.",
            });
            return;
        }

        // Kiểm tra xem số phòng mới có trùng với phòng khác không
        const isDuplicate = validRooms.some(
            (r) =>
                r.roomId !== editingRoom.roomId &&
                r.roomNumber?.trim().toLowerCase() === newNumber.toLowerCase()
        );
        if (isDuplicate) {
            notification.warning({
                message: "Số phòng đã tồn tại",
                description: `Số phòng "${newNumber}" đã được sử dụng bởi một phòng khác trong loại phòng này.`,
            });
            return;
        }

        try {
            setIsUpdatingRoom(true);
            await updatePhysicalRoom(currentRoomType.roomtypeId, editingRoom.roomId, {
                roomNumber: newNumber,
                status: editingRoom.status || "ACTIVE",
            });

            notification.success({
                message: "Thành công",
                description: `Đã cập nhật phòng "${newNumber}" thành công.`,
            });

            setEditingRoom(null);
            fetchRoomTypeDetail(currentRoomType.roomtypeId);
        } catch (error) {
            console.error("Lỗi khi cập nhật phòng:", error);
            notification.error({
                message: error?.response?.status === 409 ? "Trùng lặp số phòng" : "Cập nhật phòng thất bại",
                description: error?.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật phòng.",
            });
        } finally {
            setIsUpdatingRoom(false);
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
            render: (text) => (
                <span className="font-bold text-slate-800 text-sm">
                    Phòng {text}
                </span>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            width: 170,
            align: "center",
            render: (_, record) => {
                if (record.isDeleted || statusFilter === "DELETED") {
                    return (
                        <Tag color="error">
                            Đã xóa
                        </Tag>
                    );
                }
                if (record.status === "INACTIVE") {
                    return (
                        <Tag icon={<CloseCircleOutlined />} color="error">
                            Bị khóa
                        </Tag>
                    );
                }
                return (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Hoạt động
                    </Tag>
                );
            },
        },
        ...(isManager
            ? [
                {
                    title: "Hành động",
                    key: "action",
                    width: 130,
                    align: "center",
                    render: (_, record) => {
                        const isDeleted = record.isDeleted || statusFilter === "DELETED";

                        if (isDeleted) {
                            return (
                                <Space size="middle">
                                    <Tooltip title="Khôi phục phòng này">
                                        <Popconfirm
                                            title="Khôi phục phòng vật lý?"
                                            description={`Khôi phục phòng ${record.roomNumber} về hoạt động bình thường?`}
                                            onConfirm={() => handleRestoreRoom(record.roomId)}
                                            okText="Khôi phục"
                                            cancelText="Hủy"
                                        >
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<RollbackOutlined />}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-xs flex items-center"
                                            >
                                                Khôi phục
                                            </Button>
                                        </Popconfirm>
                                    </Tooltip>
                                </Space>
                            );
                        }

                        const isCurrentlyActive = record.status !== "INACTIVE";
                        return (
                            <Space size="middle">
                                {/* Nút Khóa / Mở khóa phòng */}
                                <Tooltip
                                    title={
                                        isCurrentlyActive
                                            ? "Khóa phòng (ngừng nhận khách đặt)"
                                            : "Mở khóa phòng (sẵn sàng đón khách)"
                                    }
                                >
                                    <Popconfirm
                                        title={isCurrentlyActive ? "Khóa phòng này?" : "Mở khóa phòng này?"}
                                        description={
                                            isCurrentlyActive
                                                ? `Khách hàng sẽ không thể đặt phòng ${record.roomNumber} cho đến khi bạn mở khóa lại.`
                                                : `Phòng ${record.roomNumber} sẽ sẵn sàng nhận khách đặt.`
                                        }
                                        onConfirm={() => handleToggleStatus(record)}
                                        okText={isCurrentlyActive ? "Khóa phòng" : "Mở khóa"}
                                        cancelText="Hủy"
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            className={
                                                isCurrentlyActive
                                                    ? "text-amber-500 hover:text-amber-600"
                                                    : "text-emerald-600 hover:text-emerald-700"
                                            }
                                            icon={
                                                isCurrentlyActive ? (
                                                    <LockOutlined className="text-base" />
                                                ) : (
                                                    <UnlockOutlined className="text-base" />
                                                )
                                            }
                                        />
                                    </Popconfirm>
                                </Tooltip>

                                {/* Nút Chỉnh sửa */}
                                <Tooltip title="Chỉnh sửa số phòng & trạng thái">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined className="text-blue-600 text-base" />}
                                        onClick={() => handleOpenEditModal(record)}
                                    />
                                </Tooltip>

                                {/* Nút Xóa mềm phòng */}
                                <Tooltip title="Xóa phòng (chuyển vào thùng rác)">
                                    <Popconfirm
                                        title="Xác nhận xóa phòng?"
                                        description={`Bạn có chắc chắn muốn chuyển phòng ${record.roomNumber} vào thùng rác không?`}
                                        onConfirm={() => handleDeleteRoom(record.roomId)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined className="text-base" />}
                                        />
                                    </Popconfirm>
                                </Tooltip>
                            </Space>
                        );
                    },
                },
            ]
            : []),
    ];

    return (
        <Spin spinning={isLoadRoom}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-base font-bold text-slate-800 m-0 flex items-center gap-2">
                        <ApartmentOutlined className="text-blue-600" />
                        Danh sách phòng vật lý
                    </h3>
                    <span className="text-xs text-slate-500">
                        {statusFilter === "DELETED"
                            ? `Có ${deletedRooms.length} phòng vật lý trong thùng rác`
                            : `Tổng cộng ${validRooms.length} phòng vật lý trong loại phòng này`}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Nút chuyển đổi bộ lọc trạng thái: Tất cả, Hoạt động, Bị khóa, Đã xóa */}
                    <Radio.Group
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                        buttonStyle="solid"
                    >
                        <Radio.Button value="ALL">
                            Tất cả ({validRooms.length})
                        </Radio.Button>
                        <Radio.Button value="ACTIVE">
                            Hoạt động ({countActive})
                        </Radio.Button>
                        <Radio.Button value="INACTIVE">
                            Bị khóa ({countLocked})
                        </Radio.Button>
                        <Radio.Button value="DELETED">
                            Đã xóa ({deletedRooms.length})
                        </Radio.Button>
                    </Radio.Group>

                    {isManager && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => setIsShowModalNewRoom(true)}
                        >
                            Thêm phòng
                        </Button>
                    )}
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={displayRooms}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                rowKey="roomId"
                size="small"
            />

            {/* Modal Thêm phòng vật lý mới */}
            <Modal
                title={
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <PlusOutlined className="text-blue-600" />
                        <span className="font-bold text-slate-800">Thêm phòng vật lý mới</span>
                    </div>
                }
                open={isShowModalNewRoom}
                onCancel={() => {
                    setIsShowModalNewRoom(false);
                    setInputs([""]);
                }}
                onOk={handleNewRoom}
                confirmLoading={isLoadRoom}
                okText="Thêm phòng"
                cancelText="Hủy"
                destroyOnClose
            >
                <div className="space-y-3 py-3">
                    <p className="text-xs text-slate-500 m-0">
                        Nhập số phòng thực tế (ví dụ: 101, 102, 201A...). Bạn có thể nhập nhiều số phòng phân tách bởi dấu phẩy:
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
                                    icon={<CloseCircleOutlined />}
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

            {/* Modal Cập nhật thông tin phòng vật lý */}
            <Modal
                title={
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <EditOutlined className="text-blue-600" />
                        <span className="font-bold text-slate-800">
                            Cập nhật phòng vật lý #{editingRoom?.roomId}
                        </span>
                    </div>
                }
                open={!!editingRoom}
                onCancel={() => setEditingRoom(null)}
                onOk={handleSaveEditRoom}
                confirmLoading={isUpdatingRoom}
                okText="Lưu thay đổi"
                cancelText="Hủy"
                destroyOnClose
            >
                <div className="space-y-4 py-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Số phòng: <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="Ví dụ: 101, 101A..."
                            value={editingRoom?.roomNumber || ""}
                            onChange={(e) =>
                                setEditingRoom({
                                    ...editingRoom,
                                    roomNumber: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Trạng thái hoạt động:
                        </label>
                        <Select
                            value={editingRoom?.status || "ACTIVE"}
                            onChange={(val) =>
                                setEditingRoom({
                                    ...editingRoom,
                                    status: val,
                                })
                            }
                            style={{ width: "100%" }}
                            options={[
                                { label: "Hoạt động", value: "ACTIVE" },
                                { label: "Bị khóa", value: "INACTIVE" },
                            ]}
                        />
                    </div>
                </div>
            </Modal>
        </Spin>
    );
};

export default RoomTable;

