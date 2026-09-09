import { Select, Tag } from "antd";
import { ShopOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { globalContext } from "../context/GlobalContext";
import {ACCOMMODATION_TYPE_CONFIG} from "../config/themeConfig";

const SelectHotel = () => {
    const {
        listHotel,
        selectedAccommodationId,
        setSelectedAccommodationId,
        isLoading
    } = useContext(globalContext);

    const options = [
        {
            value: "",
            label: (
                <div className="flex items-center justify-between gap-2 py-0.5">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <AppstoreOutlined className="text-slate-400 text-xs shrink-0" />
                        <span className="truncate font-medium text-slate-700">
                            Tất cả cơ sở lưu trú
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                       
                        <Tag color="blue" className="ml-auto text-[10px] m-0 ">
                            {listHotel?.length || 0} Cơ Sở
                        </Tag>
                    </div>
                </div>
            ),
        },
        ...(listHotel || []).map((hotel) => ({
            value: String(hotel.accommodationId),
            label: (
                <div className="flex items-center justify-between gap-2 py-0.5">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <ShopOutlined className="text-slate-400 text-xs shrink-0" />
                        <span className="truncate font-medium text-slate-700">
                            {hotel.accommodationName}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {/* <span className="text-[10px] text-slate-400 font-mono">
                            #{hotel.accommodationId}
                        </span> */}
                        {hotel.type && (
                            <Tag color={ACCOMMODATION_TYPE_CONFIG[hotel.type].color} className="text-[10px] m-0">
                                {ACCOMMODATION_TYPE_CONFIG[hotel.type].label}
                            </Tag>
                        )}
                    </div>
                </div>
            ),
        })),
    ];

    return (
        <div className="flex items-center">
            <Select
                value={selectedAccommodationId ? String(selectedAccommodationId) : ""}
                onChange={(value) => setSelectedAccommodationId(value)}
                options={options}
                loading={isLoading}
                style={{ minWidth: 320, maxWidth: 450 }}
                placeholder="Chọn cơ sở quản lý"
                className="property-selector shadow-xs"
                popupMatchSelectWidth={false}
            />
        </div>
    );
};

export default SelectHotel;
