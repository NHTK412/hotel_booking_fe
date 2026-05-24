import { Button } from "antd";

const StaffHeader = () => {
    return (
        <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-medium mb-5">Danh sách nhân viên</h2>
            <Button type="primary" className="mb-5">Thêm nhân viên</Button>
        </div>);
}

export default StaffHeader;