import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon in Vite / Webpack
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component tự động sửa kích thước bản đồ khi Modal hiển thị xong hiệu ứng (invalidateSize)
const MapResizer = () => {
    const map = useMap();

    useEffect(() => {
        const t1 = setTimeout(() => map.invalidateSize(), 150);
        const t2 = setTimeout(() => map.invalidateSize(), 400);
        const t3 = setTimeout(() => map.invalidateSize(), 800);

        const handleResize = () => map.invalidateSize();
        window.addEventListener("resize", handleResize);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            window.removeEventListener("resize", handleResize);
        };
    }, [map]);

    return null;
};

// Component lắng nghe sự kiện click trên bản đồ để chọn tọa độ
const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            if (onLocationSelect) {
                onLocationSelect({
                    lat: parseFloat(e.latlng.lat.toFixed(6)),
                    lng: parseFloat(e.latlng.lng.toFixed(6)),
                });
            }
        },
    });
    return null;
};

// Component tự động di chuyển camera bản đồ khi tọa độ thay đổi từ bên ngoài
const MapCenterController = ({ lat, lng }) => {
    const map = useMap();

    useEffect(() => {
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            const currentCenter = map.getCenter();
            const dist = Math.abs(currentCenter.lat - lat) + Math.abs(currentCenter.lng - lng);
            // Chỉ flyTo nếu tọa độ dịch chuyển đáng kể (tránh giật khi click trực tiếp)
            if (dist > 0.0001) {
                map.flyTo([lat, lng], Math.max(map.getZoom(), 14), {
                    duration: 0.8,
                });
            }
        }
    }, [lat, lng, map]);

    return null;
};

const LeafletLocationPicker = ({
    latitude = 10.7769,
    longitude = 106.7009,
    onChange,
    height = "260px",
    label = "Vị trí đã ghim",
}) => {
    const validLat = latitude && !isNaN(latitude) ? Number(latitude) : 10.7769;
    const validLng = longitude && !isNaN(longitude) ? Number(longitude) : 106.7009;

    return (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs">
            <MapContainer
                center={[validLat, validLng]}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height, width: "100%", zIndex: 1 }}
            >
                {/* Sử dụng Google Maps raster tiles: Không dính watermark bản quyền, tốc độ cực nhanh, tiếng Việt đầy đủ */}
                <TileLayer
                    attribution='&copy; Google Maps'
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    maxZoom={20}
                />

                <Marker position={[validLat, validLng]}>
                    <Popup>
                        <div className="text-xs">
                            <strong className="text-blue-600">{label}</strong>
                            <br />
                            Tọa độ: {validLat.toFixed(6)}, {validLng.toFixed(6)}
                        </div>
                    </Popup>
                </Marker>

                <MapResizer />
                <MapClickHandler onLocationSelect={onChange} />
                <MapCenterController lat={validLat} lng={validLng} />
            </MapContainer>

            <div className="absolute bottom-2 left-2 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-700 shadow-sm border border-slate-200 pointer-events-none">
                📍 Click trên bản đồ để chọn tọa độ
            </div>
        </div>
    );
};

export default LeafletLocationPicker;
