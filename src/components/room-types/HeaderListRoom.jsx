import { Button, Modal } from "antd";
import NewRoomType from "./NewRoomType";
import { useContext, useState } from "react";
import { globalContext } from "../../context/GlobalContext";

const HeaderListRoom = ({
    fetchRoomTypes
}) => {

    const [isShowModalNewRoomType, setIsShowModalNewRoomType] = useState(false);
    const { listHotel, hotelCurrent } = useContext(globalContext);





    return (
        <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-medium mb-5">Danh sách loại phòng</h2>
            {
                listHotel[hotelCurrent]?.staffRole === 'ROLE_MANAGER' && (
                    <Button color="primary" variant="solid" onClick={() => setIsShowModalNewRoomType(true)}>
                        Thêm loại phòng
                    </Button>
                )
            }
            <Modal
                footer={null}
                title="Thêm loại phòng mới"
                open={isShowModalNewRoomType}
                onCancel={() => setIsShowModalNewRoomType(false)}
                onOk={() => {
                    setIsShowModalNewRoomType(false);
                }}
            >
                <NewRoomType fetchRoomTypes={fetchRoomTypes} setIsShowModalNewRoomType={setIsShowModalNewRoomType} />
            </Modal>
        </div >
    )
}


export default HeaderListRoom;