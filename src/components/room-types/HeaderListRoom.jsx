import { Button } from "antd";

const HeaderListRoom = ({
    fetchRoomTypes
}) => {



    return (
        <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-medium mb-5">Danh sách loại phòng</h2>
            <Button color="primary" variant="solid">
                Thêm loại phòng
            </Button>
        </div>
    )
}


export default HeaderListRoom;