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

// Component tự động di chuyển camera bản đồ khi tọa độ thay đổi
const MapCenterController = ({ lat, lng }) => {
    const map = useMap();

    useEffect(() => {
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            map.flyTo([lat, lng], Math.max(map.getZoom(), 13), {
                duration: 1.2,
            });
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
                zoom={13}
                scrollWheelZoom={false}
                style={{ height, width: "100%", zIndex: 1 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[validLat, validLng]}>
                    <Popup>
                        <div className="text-xs">
                            <strong>{label}</strong>
                            <br />
                            Tọa độ: {validLat}, {validLng}
                        </div>
                    </Popup>
                </Marker>

                <MapClickHandler onLocationSelect={onChange} />
                <MapCenterController lat={validLat} lng={validLng} />
            </MapContainer>

            <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2 py-1 rounded text-[11px] text-slate-600 shadow-xs border border-slate-200 pointer-events-none">
                💡 Click trên bản đồ để ghim tọa độ
            </div>
        </div>
    );
};

export default LeafletLocationPicker;
