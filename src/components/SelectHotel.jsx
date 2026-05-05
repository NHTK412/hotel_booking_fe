import { Button, Modal } from "antd";
import { useState } from "react";

const SelectHotel = ({ hotelList, hotelCurrent, setHotelCurrent }) => {



    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <Button className="ml-5" type="primary" onClick={() => setIsModalOpen(true)}>
                {/* Khách Sạn ABC */}
                {hotelList[hotelCurrent]?.accommodationName || "Chọn khách sạn"}
            </Button>
            <Modal
                title="Chọn khách sạn"
                open={isModalOpen}
                footer={null}
                onCancel={() => setIsModalOpen(false)}
            // open={false}
            // onOk={() => { }}
            >
                {hotelList.map((hotel, index) => (
                    <div
                        key={hotel.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                        onClick={() => {
                            // setHotelCurrent(hotel.id);
                            setHotelCurrent(index); 
                            setIsModalOpen(false);
                        }}
                    >
                        #{hotel.accommodationId} - {hotel.accommodationName}
                    </div>
                ))}
            </Modal>
        </div >


    );
}

export default SelectHotel;