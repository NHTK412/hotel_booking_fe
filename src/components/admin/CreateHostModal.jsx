import { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    Radio,
    DatePicker,
    Button,
    Upload,
    Row,
    Col,
    notification,
    Tag,
    Alert,
    Tooltip,
} from "antd";
import {
    UserAddOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    UploadOutlined,
    LoadingOutlined,
    CopyOutlined,
    CheckCircleFilled,
    KeyOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    IdcardOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { registerHost } from "../../services/UserService";
import { getAllAccommodations } from "../../services/AccommodationService";
import { uploadFile } from "../../services/UploadFileService";
import { USER_ROLE_CONFIG, ACCOMMODATION_TYPE_CONFIG, getAccommodationTypeConfig } from "../../config/themeConfig";

const GENDER_OPTIONS = [
    { value: "MALE", label: "Nam" },
    { value: "FEMALE", label: "Nữ" },
    { value: "OTHER", label: "Khác" },
];

const PHONE_REGEX = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

const CreateHostModal = ({
    open,
    onClose,
    onSuccess,
    isHostView = false,
    defaultAccommodationId = undefined,
}) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [accommodations, setAccommodations] = useState([]);
    const [isLoadingAccommodations, setIsLoadingAccommodations] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [createdResult, setCreatedResult] = useState(null);

    // Tải danh sách khách sạn để liên kết
    useEffect(() => {
        if (open) {
            loadAccommodations();
            form.resetFields();
            setAvatarUrl("");
            setCreatedResult(null);
            setShowPassword(false);

            form.setFieldsValue({
                hostRole: isHostView ? "ROLE_RECEPTIONIST" : "ROLE_MANAGER",
                gender: "MALE",
                accommodationId: defaultAccommodationId || undefined,
            });
        }
    }, [open, isHostView, defaultAccommodationId]);

    const loadAccommodations = async () => {
        try {
            setIsLoadingAccommodations(true);
            const response = await getAllAccommodations({
                page: 0,
                size: 200,
                includeDeleted: false,
            });
            const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
            setAccommodations(list);
        } catch (error) {
            console.error("Lỗi lấy danh sách khách sạn:", error);
            notification.error({
                message: "Không thể tải danh sách khách sạn",
                description: "Vui lòng thử lại sau.",
            });
        } finally {
            setIsLoadingAccommodations(false);
        }
    };

    const handleUploadAvatar = async (file) => {
        try {
            setIsUploading(true);
            const res = await uploadFile(file);
            const uploadedUrl = res?.data?.filePath || res?.filePath || res?.url || "";
            if (uploadedUrl) {
                setAvatarUrl(uploadedUrl);
                notification.success({
                    message: "Tải ảnh thành công",
                    description: "Ảnh đại diện đã được cập nhật.",
                });
            }
        } catch (error) {
            console.error("Lỗi tải ảnh đại diện:", error);
            notification.error({
                message: "Tải ảnh thất bại",
                description: error?.message || "Vui lòng thử lại.",
            });
        } finally {
            setIsUploading(false);
        }
        return false;
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            const payload = {
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                phone: values.phone.trim(),
                gender: values.gender,
                address: values.address ? values.address.trim() : "",
                avatarUrl: avatarUrl || "",
                accommodationId: Number(values.accommodationId),
                hostRole: values.hostRole,
                birthday: values.birthday
                    ? dayjs(values.birthday).format("YYYY-MM-DD[T]00:00:00")
                    : null,
            };

            await registerHost(payload);

            const matchedAcc = accommodations.find(
                (acc) => Number(acc.accommodationId) === Number(values.accommodationId)
            );

            const hotelName = matchedAcc?.accommodationName || `Khách sạn #${values.accommodationId}`;

            // Lưu kết quả để hiển thị hộp thoại bàn giao
            setCreatedResult({
                name: values.name,
                email: values.email,
                phone: values.phone,
                hotelName: hotelName,
                role: values.hostRole,
                password: "password123",
                accommodationId: values.accommodationId,
            });

            notification.success({
                message: "Cấp tài khoản thành công!",
                description: `Tài khoản ${values.email} đã được liên kết với cơ sở lưu trú "${hotelName}".`,
            });
        } catch (error) {
            console.error("Lỗi cấp tài khoản host:", error);
            const status = error?.response?.status;
            const errorMsg = error?.response?.data?.message || "";

            if (status === 409 || errorMsg.includes("Email đã được sử dụng")) {
                form.setFields([
                    {
                        name: "email",
                        errors: ["Email này đã tồn tại trong hệ thống. Vui lòng chọn email khác."],
                    },
                ]);
                notification.error({
                    message: "Email đã tồn tại",
                    description: "Email này đã được sử dụng bởi một tài khoản khác trong hệ thống.",
                });
            } else if (status === 403) {
                notification.error({
                    message: "Từ chối phân quyền",
                    description:
                        errorMsg ||
                        "Chủ khách sạn chỉ có quyền cấp tài khoản Lễ tân (ROLE_RECEPTIONIST) cho cơ sở của mình.",
                });
            } else {
                notification.error({
                    message: "Cấp tài khoản thất bại",
                    description: errorMsg || error?.message || "Đã xảy ra lỗi khi tạo tài khoản.",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyText = (text, label) => {
        navigator.clipboard.writeText(text);
        notification.success({
            message: "Đã sao chép",
            description: `Đã sao chép ${label} vào bộ nhớ tạm.`,
            duration: 2,
        });
    };

    const handleCopyAllCredentials = () => {
        if (!createdResult) return;
        const roleLabel = USER_ROLE_CONFIG[createdResult.role]?.label || createdResult.role;
        const formattedText = `==============================\nTHÔNG TIN TÀI KHOẢN HỆ THỐNG HOTEL BOOKING\n==============================\n• Họ và tên: ${createdResult.name}\n• Khách sạn: ${createdResult.hotelName}\n• Vai trò: ${roleLabel}\n• Email đăng nhập: ${createdResult.email}\n• Mật khẩu khởi tạo: ${createdResult.password}\n• Đường dẫn đăng nhập: ${window.location.origin}/login\n==============================\n* Quý đối tác vui lòng đổi mật khẩu sau khi đăng nhập lần đầu tiên.`;

        navigator.clipboard.writeText(formattedText);
        notification.success({
            message: "Đã sao chép toàn bộ thông tin!",
            description: "Nội dung bàn giao đã sẵn sàng để gửi cho đối tác.",
            duration: 3,
        });
    };

    const handleFinish = () => {
        onSuccess && onSuccess(createdResult);
        setCreatedResult(null);
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={createdResult ? handleFinish : onClose}
            footer={null}
            width={720}
            destroyOnClose
            centered
            className="top-6"
            title={
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <UserAddOutlined className="text-lg" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800 m-0">
                            {createdResult ? "Bàn Giao Tài Khoản Khách Sạn" : "Cấp Tài Khoản Quản Lý / Host"}
                        </h2>
                        <p className="text-xs text-slate-500 m-0">
                            {createdResult
                                ? "Thông tin tài khoản và mật khẩu khởi tạo an toàn"
                                : "Khởi tạo tài khoản nhân sự và liên kết quyền quản lý cơ sở lưu trú"}
                        </p>
                    </div>
                </div>
            }
        >
            {createdResult ? (
                /* Màn hình bàn giao tài khoản thành công */
                <div className="py-4 space-y-5">
                    <div className="flex flex-col items-center justify-center text-center p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                        <CheckCircleFilled className="text-4xl text-emerald-500 mb-2" />
                        <h3 className="text-lg font-bold text-slate-800 m-0">Khởi Tạo Tài Khoản Thành Công!</h3>
                        <p className="text-xs text-slate-600 mt-1 max-w-md">
                            Tài khoản quản lý đã được kích hoạt thành công trên hệ thống và liên kết với cơ sở lưu trú.
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Chi tiết tài khoản bàn giao
                            </span>
                            <Tag color={USER_ROLE_CONFIG[createdResult.role]?.tagColor || "blue"} className="font-semibold px-2.5 py-0.5">
                                {USER_ROLE_CONFIG[createdResult.role]?.label || createdResult.role}
                            </Tag>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                                <span className="text-xs text-slate-400 block mb-0.5">Họ và tên người nhận</span>
                                <span className="font-semibold text-slate-800">{createdResult.name}</span>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                                <span className="text-xs text-slate-400 block mb-0.5">Cơ sở lưu trú liên kết</span>
                                <span className="font-semibold text-blue-700 truncate block">
                                    {createdResult.hotelName}
                                </span>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-slate-400 block mb-0.5">Email đăng nhập</span>
                                    <span className="font-semibold text-slate-800 font-mono text-xs">
                                        {createdResult.email}
                                    </span>
                                </div>
                                <Tooltip title="Sao chép email">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={() => handleCopyText(createdResult.email, "Email")}
                                    />
                                </Tooltip>
                            </div>

                            <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200 shadow-2xs flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-amber-700 font-medium block mb-0.5">
                                        Mật khẩu khởi tạo mặc định
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold font-mono text-sm text-amber-900 tracking-wider">
                                            {showPassword ? createdResult.password : "•••••••••••"}
                                        </span>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                                            onClick={() => setShowPassword(!showPassword)}
                                        />
                                    </div>
                                </div>
                                <Tooltip title="Sao chép mật khẩu">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CopyOutlined className="text-amber-700" />}
                                        onClick={() => handleCopyText(createdResult.password, "Mật khẩu")}
                                    />
                                </Tooltip>
                            </div>
                        </div>

                        <Alert
                            type="info"
                            showIcon
                            icon={<InfoCircleOutlined />}
                            message={
                                <span className="text-xs text-slate-600">
                                    Mật khẩu mặc định hệ thống cấp phát là <strong className="font-mono text-slate-900">password123</strong>. Đối tác có thể tự đổi mật khẩu sau khi đăng nhập thành công vào cổng quản trị.
                                </span>
                            }
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                        <Button
                            icon={<CopyOutlined />}
                            onClick={handleCopyAllCredentials}
                            size="large"
                            className="w-full sm:w-auto"
                        >
                            Sao chép toàn bộ thông tin
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleFinish}
                            size="large"
                            className="w-full sm:w-auto"
                        >
                            Hoàn tất & Đóng
                        </Button>
                    </div>
                </div>
            ) : (
                /* Form nhập dữ liệu cấp Host */
                <Form form={form} layout="vertical" className="pt-4" onFinish={handleSubmit}>
                    <Row gutter={[16, 0]}>
                        {/* Phân quyền vai trò */}
                        <Col span={24}>
                            <Form.Item
                                name="hostRole"
                                label={
                                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                        <IdcardOutlined className="text-blue-600" />
                                        Vai trò nhân sự phân quyền
                                    </span>
                                }
                                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                            >
                                <Radio.Group
                                    className="w-full !grid !grid-cols-2 !gap-4"
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "16px",
                                        width: "100%",
                                    }}
                                >
                                    <Tooltip title="Toàn quyền quản lý phòng, cài đặt giá, doanh thu và nhân sự cơ sở.">
                                        <Radio.Button
                                            value="ROLE_MANAGER"
                                            disabled={isHostView}
                                            className="!h-10 !rounded-lg !border flex items-center justify-center font-medium w-full text-center before:!hidden"
                                            style={{
                                                width: "100%",
                                                height: "40px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <span className="flex items-center justify-center gap-1.5 w-full">
                                                <span className="font-semibold text-slate-800">Chủ Khách Sạn / Quản Lý</span>
                                                <InfoCircleOutlined className="text-slate-400 text-xs" />
                                            </span>
                                        </Radio.Button>
                                    </Tooltip>

                                    <Tooltip title="Tiếp đón check-in, check-out, xem lịch nhận phòng và buồng phòng.">
                                        <Radio.Button
                                            value="ROLE_RECEPTIONIST"
                                            className="!h-10 !rounded-lg !border flex items-center justify-center font-medium w-full text-center before:!hidden"
                                            style={{
                                                width: "100%",
                                                height: "40px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <span className="flex items-center justify-center gap-1.5 w-full">
                                                <span className="font-semibold text-slate-800">Nhân Viên Lễ Tân</span>
                                                <InfoCircleOutlined className="text-slate-400 text-xs" />
                                            </span>
                                        </Radio.Button>
                                    </Tooltip>
                                </Radio.Group>
                            </Form.Item>
                        </Col>

                        {/* Chọn khách sạn */}
                        <Col span={24}>
                            <Form.Item
                                name="accommodationId"
                                label={
                                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                        <HomeOutlined className="text-blue-600" />
                                        Cơ sở lưu trú phụ trách
                                    </span>
                                }
                                rules={[{ required: true, message: "Vui lòng chọn khách sạn cần gán quyền" }]}
                            >
                                <Select
                                    placeholder="Tìm kiếm và chọn cơ sở lưu trú..."
                                    showSearch
                                    loading={isLoadingAccommodations}
                                    filterOption={(input, option) => {
                                        const searchTarget = option?.searchLabel || "";
                                        return searchTarget.toLowerCase().includes(input.toLowerCase());
                                    }}
                                    options={accommodations.map((acc) => {
                                        const typeCfg = getAccommodationTypeConfig(acc.type);
                                        return {
                                            value: acc.accommodationId,
                                            searchLabel: `${acc.accommodationId} ${acc.accommodationName} ${typeCfg?.label || acc.type || ""}`,
                                            label: (
                                                <div className="flex items-center justify-between w-full">
                                                    <span>
                                                        <span className="font-semibold mr-1.5 text-slate-700">
                                                            #{acc.accommodationId}.
                                                        </span>
                                                        <span className="text-slate-800 font-medium">
                                                            {acc.accommodationName}
                                                        </span>
                                                    </span>
                                                    <Tag color={typeCfg?.tagColor || "default"} className="ml-2 mr-0 text-[11px]">
                                                        {typeCfg?.label || acc.type || "Chỗ nghỉ"}
                                                    </Tag>
                                                </div>
                                            ),
                                        };
                                    })}
                                    disabled={isHostView && !!defaultAccommodationId}
                                />
                            </Form.Item>
                        </Col>

                        {/* Họ tên */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="name"
                                label={<span className="font-semibold text-slate-700">Họ và tên người đại diện</span>}
                                rules={[
                                    { required: true, message: "Vui lòng nhập họ tên" },
                                    { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
                                ]}
                            >
                                <Input
                                    placeholder="Ví dụ: Nguyễn Văn Quản Lý"
                                    prefix={<UserAddOutlined className="text-slate-400" />}
                                />
                            </Form.Item>
                        </Col>

                        {/* Email */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="email"
                                label={<span className="font-semibold text-slate-700">Email đăng nhập</span>}
                                rules={[
                                    { required: true, message: "Vui lòng nhập email" },
                                    { type: "email", message: "Email không đúng định dạng chuẩn" },
                                ]}
                            >
                                <Input
                                    placeholder="manager@hotel.com"
                                    prefix={<MailOutlined className="text-slate-400" />}
                                />
                            </Form.Item>
                        </Col>

                        {/* Số điện thoại */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="phone"
                                label={<span className="font-semibold text-slate-700">Số điện thoại liên hệ</span>}
                                rules={[
                                    { required: true, message: "Vui lòng nhập số điện thoại" },
                                    {
                                        pattern: PHONE_REGEX,
                                        message: "Số điện thoại Việt Nam không hợp lệ (VD: 0901234567)",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="0901234567"
                                    prefix={<PhoneOutlined className="text-slate-400" />}
                                />
                            </Form.Item>
                        </Col>

                        {/* Giới tính */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="gender"
                                label={<span className="font-semibold text-slate-700">Giới tính</span>}
                            >
                                <Radio.Group options={GENDER_OPTIONS} optionType="button" buttonStyle="solid" />
                            </Form.Item>
                        </Col>

                        {/* Ngày sinh */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="birthday"
                                label={<span className="font-semibold text-slate-700">Ngày sinh</span>}
                            >
                                <DatePicker
                                    className="w-full"
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày sinh"
                                    disabledDate={(current) => current && current > dayjs().endOf("day")}
                                />
                            </Form.Item>
                        </Col>

                        {/* Địa chỉ */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="address"
                                label={<span className="font-semibold text-slate-700">Địa chỉ cư trú</span>}
                            >
                                <Input
                                    placeholder="Quận 1, TP. Hồ Chí Minh"
                                    prefix={<EnvironmentOutlined className="text-slate-400" />}
                                />
                            </Form.Item>
                        </Col>

                        {/* Tải ảnh đại diện */}
                        <Col span={24}>
                            <Form.Item
                                label={<span className="font-semibold text-slate-700">Ảnh đại diện nhân sự</span>}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                                        {isUploading ? (
                                            <LoadingOutlined className="text-blue-600 text-xl" />
                                        ) : avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserAddOutlined className="text-slate-400 text-2xl" />
                                        )}
                                    </div>
                                    <Upload
                                        beforeUpload={handleUploadAvatar}
                                        showUploadList={false}
                                        accept="image/*"
                                    >
                                        <Button icon={<UploadOutlined />} loading={isUploading}>
                                            Tải ảnh lên
                                        </Button>
                                    </Upload>
                                    {avatarUrl && (
                                        <Button type="link" danger onClick={() => setAvatarUrl("")}>
                                            Xóa ảnh
                                        </Button>
                                    )}
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Alert
                        type="warning"
                        showIcon
                        className="mb-4 text-xs"
                        message={
                            <span>
                                <strong>Lưu ý:</strong> Mật khẩu khởi tạo tài khoản mặc định là{" "}
                                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">password123</code>
                                . Sau khi tạo thành công, hệ thống sẽ cung cấp thông tin bàn giao chi tiết.
                            </span>
                        }
                    />

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <Button onClick={onClose} disabled={isSubmitting}>
                            Hủy bỏ
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isSubmitting}
                            icon={<KeyOutlined />}
                        >
                            Cấp Tài Khoản
                        </Button>
                    </div>
                </Form>
            )}
        </Modal>
    );
};

export default CreateHostModal;
