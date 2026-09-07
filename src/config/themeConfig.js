
export const palette = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#1e40af', // Primary Main
    700: '#1d4ed8', // Primary Hover
    800: '#1e3a8a', // Primary Active
    900: '#172554',
  },

  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  success: {
    light: '#ecfdf5',
    main: '#10b981', // Check-out hoàn tất, phòng trống có sẵn, thành công
    hover: '#059669',
    dark: '#047857',
  },
  warning: {
    light: '#fffbeb',
    main: '#f59e0b', // Chờ nhận phòng (Pending), chờ xử lý
    hover: '#d97706',
    dark: '#b45309',
  },
  error: {
    light: '#fef2f2',
    main: '#ef4444', // Đã hủy (Canceled), thất bại, nguy hiểm
    hover: '#dc2626',
    dark: '#b91c1c',
  },
  info: {
    light: '#f0f9ff',
    main: '#0ea5e9', // Đang lưu trú (Checked-in), tin tức
    hover: '#0284c7',
    dark: '#0369a1',
  },

  neutral: {
    white: '#ffffff',
    50: '#f8fafc',  // Background Layout chính
    100: '#f1f5f9', // Background thẻ phụ, hover item
    200: '#e2e8f0', // Border mềm
    300: '#cbd5e1', // Border đậm
    400: '#94a3b8', // Muted text, disabled
    500: '#64748b', // Placeholder text
    600: '#475569', // Secondary text
    700: '#334155', // Body text
    800: '#1e293b', // Sub-heading
    900: '#0f172a', // Main heading text
    black: '#020617',
  },
};

export const antdTheme = {
  token: {
    // Primary
    colorPrimary: palette.primary[600],
    colorPrimaryHover: palette.primary[700],
    colorPrimaryActive: palette.primary[800],
    colorPrimaryBg: palette.primary[50],

    // Functional
    colorSuccess: palette.success.main,
    colorSuccessBg: palette.success.light,
    colorWarning: palette.warning.main,
    colorWarningBg: palette.warning.light,
    colorError: palette.error.main,
    colorErrorBg: palette.error.light,
    colorInfo: palette.info.main,
    colorInfoBg: palette.info.light,

    // Neutrals & Surfaces
    colorBgBase: palette.neutral.white,
    colorBgLayout: palette.neutral[50],
    colorBgContainer: palette.neutral.white,
    colorBorder: palette.neutral[200],
    colorBorderSecondary: palette.neutral[100],

    // Typography
    colorTextBase: palette.neutral[900],
    colorText: palette.neutral[800],
    colorTextSecondary: palette.neutral[600],
    colorTextTertiary: palette.neutral[400],

    // Global Geometry
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      headerBg: palette.neutral.white,
      bodyBg: palette.neutral[50],
      siderBg: palette.neutral.white,
      triggerBg: palette.neutral[100],
      triggerColor: palette.neutral[700],
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: palette.neutral[600],
      itemSelectedColor: palette.primary[600],
      itemSelectedBg: palette.primary[50],
      itemHoverColor: palette.primary[700],
      itemHoverBg: palette.neutral[100],
      itemBorderRadius: 8,
    },
    Button: {
      borderRadius: 6,
      controlHeight: 36,
      fontWeight: 500,
      primaryShadow: '0 2px 4px rgba(30, 64, 175, 0.15)',
    },
    Table: {
      headerBg: palette.neutral[50],
      headerColor: palette.neutral[700],
      headerSplitColor: palette.neutral[200],
      rowHoverBg: palette.neutral[50],
      borderColor: palette.neutral[200],
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 12,
      headerBg: palette.neutral.white,
    },
    Modal: {
      borderRadiusLG: 12,
      headerBg: palette.neutral.white,
    },
    Tag: {
      borderRadiusSM: 4,
    },
  },
};

export const BOOKING_STATUS_CONFIG = {
  WAITING_FOR_PAYMENT: {
    value: 'WAITING_FOR_PAYMENT',
    label: 'Chờ thanh toán',
    tagColor: 'purple',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  PENDING: {
    value: 'PENDING',
    label: 'Chờ nhận phòng',
    tagColor: 'gold',
    color: palette.warning.main,
    bg: palette.warning.light,
    border: '#fde68a',
  },
  CHECKED_IN: {
    value: 'CHECKED_IN',
    label: 'Đang lưu trú',
    tagColor: 'blue',
    color: palette.info.main,
    bg: palette.info.light,
    border: '#bae6fd',
  },
  CHECKED_OUT: {
    value: 'CHECKED_OUT',
    label: 'Đã trả phòng',
    tagColor: 'green',
    color: palette.success.main,
    bg: palette.success.light,
    border: '#a7f3d0',
  },
  CANCELED: {
    value: 'CANCELED',
    label: 'Đã hủy',
    tagColor: 'volcano',
    color: palette.error.main,
    bg: palette.error.light,
    border: '#fecaca',
  },
};

export const USER_ROLE_CONFIG = {
  ROLE_ADMIN: {
    value: 'ROLE_ADMIN',
    label: 'Quản trị viên sàn',
    tagColor: 'red',
    color: '#dc2626',
  },
  ROLE_HOST: {
    value: 'ROLE_HOST',
    label: 'Chủ khách sạn',
    tagColor: 'geekblue',
    color: palette.primary[600],
  },
  ROLE_MANAGER: {
    value: 'ROLE_MANAGER',
    label: 'Quản lý cơ sở',
    tagColor: 'blue',
    color: palette.primary[500],
  },
  ROLE_RECEPTIONIST: {
    value: 'ROLE_RECEPTIONIST',
    label: 'Nhân viên lễ tân',
    tagColor: 'cyan',
    color: '#0891b2',
  },
  ROLE_STAFF: {
    value: 'ROLE_STAFF',
    label: 'Nhân viên buồng phòng',
    tagColor: 'default',
    color: palette.neutral[600],
  },
  ROLE_CUSTOMER: {
    value: 'ROLE_CUSTOMER',
    label: 'Khách hàng',
    tagColor: 'purple',
    color: '#9333ea',
  },
};

export const ACCOMMODATION_TYPE_CONFIG = {
  HOTEL: {
    value: 'HOTEL',
    label: 'Khách sạn',
    tagColor: 'blue',
    color: '#2563eb',
  },
  RESORT: {
    value: 'RESORT',
    label: 'Khu nghỉ dưỡng',
    tagColor: 'gold',
    color: '#d97706',
  },
  HOMESTAY: {
    value: 'HOMESTAY',
    label: 'Homestay',
    tagColor: 'green',
    color: '#059669',
  },
  APARTMENT: {
    value: 'APARTMENT',
    label: 'Căn hộ dịch vụ',
    tagColor: 'cyan',
    color: '#0891b2',
  },
  HOSTEL: {
    value: 'HOSTEL',
    label: 'Nhà nghỉ thanh niên',
    tagColor: 'purple',
    color: '#7c3aed',
  },
};

export const ROOM_STATUS_CONFIG = {
  AVAILABLE: {
    value: 'AVAILABLE',
    label: 'Phòng trống',
    color: palette.success.main,
    bg: palette.success.light,
    border: '#a7f3d0',
    tagColor: 'green',
  },
  OCCUPIED: {
    value: 'OCCUPIED',
    label: 'Đang có khách',
    color: palette.warning.main,
    bg: palette.warning.light,
    border: '#fde68a',
    tagColor: 'gold',
  },
  MAINTENANCE: {
    value: 'MAINTENANCE',
    label: 'Đang bảo trì',
    color: palette.neutral[400],
    bg: palette.neutral[100],
    border: palette.neutral[300],
    tagColor: 'default',
  },
};

export default antdTheme;
