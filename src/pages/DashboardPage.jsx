import { Column } from "@ant-design/charts";
import { notification } from "antd";
import { useContext, useEffect, useState } from "react";
import { getBookingMonthReport } from "../services/BookingService";
import { globalConfig } from "antd/es/config-provider";
import { globalContext } from "../context/GlobalContext";

const DashboardPage = () => {

    // const data = [
    //     {
    //         month: 'Tháng 1',
    //         value: 30,
    //     },
    //     {
    //         month: 'Tháng 2',
    //         value: 20,
    //     },
    //     {
    //         month: 'Tháng 3',
    //         value: 10,
    //     },
    //     {
    //         month: 'Tháng 4',
    //         value: 40,
    //     },
    //     {
    //         month: 'Tháng 5',
    //         value: 50,
    //     },
    //     {
    //         month: 'Tháng 6',
    //         value: 60,
    //     },
    //     {
    //         month: 'Tháng 7',
    //         value: 70,
    //     },
    //     {
    //         month: 'Tháng 8',
    //         value: 80,
    //     },
    //     {
    //         month: 'Tháng 9',
    //         value: 90,
    //     },
    //     {
    //         month: 'Tháng 10',
    //         value: 100,
    //     },
    //     {
    //         month: 'Tháng 11',
    //         value: 110,
    //     },
    //     {
    //         month: 'Tháng 12',
    //         value: 120,
    //     },
    // ]

    const {
        listHotel,
        hotelCurrent
    } = useContext(globalContext);

    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);



    const fetchData = async () => {
        try {
            // console.log("Fetching booking month report for hotel ID:", );
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