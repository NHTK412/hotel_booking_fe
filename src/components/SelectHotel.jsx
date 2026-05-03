import { Button, Modal } from "antd";
import { useState } from "react";

const SelectHotel = ({ hotelList, currentHotel, setCurrentHotel }) => {



    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <Button className="ml-5" type="primary" onClick={() => setIsModalOpen(true)}>
                {/* Khách Sạn ABC */}
                {currentHotel ? currentHotel.name : "Chọn khách sạn"}
            </Button>
            <Modal
                title="Chọn khách sạn"
                open={isModalOpen}
                footer={null}
                onCancel={() => setIsModalOpen(false)}
            // open={false}
            // onOk={() => { }}
            >
                {hotelList.map(hotel => (
                    <div
                        key={hotel.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                        onClick={() => {
                            setCurrentHotel(hotel);
                            setIsModalOpen(false);
                        }}
                    >
                        {hotel.name}
                    </div>
                ))}
            </Modal>
        </div >


    );
}

export default SelectHotel;