import { Column } from "@ant-design/charts";
import { notification } from "antd";
import { useContext, useEffect, useState } from "react";
import { getBookingMonthReport } from "../services/BookingService";
import { globalConfig } from "antd/es/config-provider";
import { globalContext } from "../context/GlobalContext";

const DashboardPage = () => {


    const {
        listHotel,
        hotelCurrent
    } = useContext(globalContext);

    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, [hotelCurrent]);



    const fetchData = async () => {
        try {
            const response = await getBookingMonthReport(listHotel[hotelCurrent].accommodationId, 2026);

            const responseFormatted = response.data.map(item => ({
                month: `Tháng ${item.month}`,
                totalBookings: item.totalBookings
            }));

            setData(responseFormatted);
        } catch (error) {
            console.error("Error fetching booking month report:", error);
            notification.error({
                title: "Lỗi",
                description: "Không thể tải báo cáo tháng. Vui lòng thử lại sau.",
            });
        }
    };


    return (
        <>
            <Column
                data={data}
                xField={"month"}
                yField={"totalBookings"}
                tooltip={{
                    items: [
                        {
                            channel: "y",
                            name: "Tổng đơn đặt"
                        }
                    ]
                }}
            >
            </Column>
        </>
    );
}

export default DashboardPage;