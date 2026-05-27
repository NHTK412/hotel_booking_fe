import { Button, Modal, Switch } from "antd";
import CreateStaff from "./CreateStaff";
import { useState } from "react";
import AddStaff from "./AddStaff";
import { UserAddOutlined } from "@ant-design/icons";

const StaffHeader = ({ currentPageSize, currentPage, fetchStaffByHotel, isDeleted, setIsDeleted }) => {

    const [isShowCreateStaff, setIsShowCreateStaff] = useState(false);
    const [isAddUser, setIsAddUser] = useState(false);



    return (
        <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-4 items-center mb-5">
                <h2 className="text-2xl font-medium">Danh sách nhân viên</h2>
                <Switch checked={isDeleted} onChange={(checked) => setIsDeleted(checked)} checkedChildren="Đã xóa" unCheckedChildren="Chưa xóa" />
            </div>
            {
                !isDeleted && (
                    <Button color="primary" variant="solid" onClick={() => setIsShowCreateStaff(true)}>
                        {/* Thêm nhân viên */}
                        <UserAddOutlined />
                    </Button>
                )
            }
            <Modal
                title="Thông Tin Nhân Viên"
                open={isShowCreateStaff}
                onCancel={() => setIsShowCreateStaff(false)}
                footer={null}
            >
                <div className="mb-5">
                    <Switch checked={isAddUser} onChange={(checked) => setIsAddUser(checked)} />
                    <label className="ml-2">{isAddUser ? "Thêm tài khoản nhân viên" : "Tạo mới nhân viên"}</label>
                </div>
                {
                    isAddUser ?
                        (
                            <>
                                <AddStaff
                                    fetchStaffByHotel={fetchStaffByHotel}
                                    currentPageSize={currentPageSize}
                                    currentPage={currentPage}
                                    setIsShowCreateStaff={setIsShowCreateStaff}
                                />
                            </>
                        )
                        :
                        (
                            <>
                                <CreateStaff
                                    fetchStaffByHotel={fetchStaffByHotel}
                                    currentPageSize={currentPageSize}
                                    currentPage={currentPage}
                                    setIsShowCreateStaff={setIsShowCreateStaff}
                                    isDeleted={isDeleted}
                                    setIsDeleted={setIsDeleted}
                                />
                            </>

                        )
                }
            </Modal>
        </div>);
}

export default StaffHeader;