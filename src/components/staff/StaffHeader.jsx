import { Button, Modal, Switch } from "antd";
import CreateStaff from "./CreateStaff";
import { useState } from "react";

const StaffHeader = ({ currentPageSize, currentPage, fetchStaffByHotel, isDeleted, setIsDeleted }) => {

    const [isShowCreateStaff, setIsShowCreateStaff] = useState(false);


    return (
        <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-4 items-center mb-5">
                <h2 className="text-2xl font-medium">Danh sách nhân viên</h2>
                <Switch checked={isDeleted} onChange={(checked) => setIsDeleted(checked)} checkedChildren="Đã xóa" unCheckedChildren="Chưa xóa" />
            </div>
            {
                !isDeleted && (
                    <Button type="primary" onClick={() => setIsShowCreateStaff(true)}>
                        Thêm nhân viên
                    </Button>
                )
            }
            <Modal
                title="Thêm nhân viên"
                open={isShowCreateStaff}
                onCancel={() => setIsShowCreateStaff(false)}
                footer={null}
            >
                <CreateStaff
                    fetchStaffByHotel={fetchStaffByHotel}
                    currentPageSize={currentPageSize}
                    currentPage={currentPage}
                    setIsShowCreateStaff={setIsShowCreateStaff}
                    isDeleted={isDeleted}
                    setIsDeleted={setIsDeleted}
                />
            </Modal>
        </div>);
}

export default StaffHeader;