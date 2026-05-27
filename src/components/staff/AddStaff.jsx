import { Button, Input, notification, Spin } from "antd";
import { useContext, useState } from "react";
import { globalContext } from "../../context/GlobalContext";
import { addStaffByEmail } from "../../services/UserService";

const AddStaff = ({ fetchStaffByHotel, currentPageSize, currentPage, setIsShowCreateStaff }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const { listHotel, hotelCurrent } = useContext(globalContext);

    const handleAddStaff = async () => {
        try {
            setIsLoading(true);
            const data = {
                email,
                roleStaff: "ROLE_RECEPTIONIST"
            }

            const respose = await addStaffByEmail(listHotel[hotelCurrent]?.accommodationId, data);
            notification.success({
                title: "Thành công",
                description: "Thêm nhân viên mới thành công"
            });
            setIsShowCreateStaff(false);
            await fetchStaffByHotel(listHotel[hotelCurrent]?.accommodationId, currentPage, currentPageSize, false);
        } catch (error) {
            console.error("Error adding staff:", error);
            notification.error({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi thêm nhân viên mới"
            });
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <Spin spinning={isLoading}>
            <div>
                <h2>Mail nhân viên: </h2>
                <Input
                    placeholder="Nhập email nhân viên"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex flex-row justify-end mt-5">
                <Button color="primary" variant="solid" onClick={handleAddStaff}>
                    Thêm nhân viên
                </Button>
            </div>
        </Spin>
    );
}

export default AddStaff;