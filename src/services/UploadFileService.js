import axios from "../config/AxiosConfig";

/**
 * Tải một file ảnh lên Cloudinary CDN
 * API: POST /api/file-upload/cdn
 * @param {File} file Tệp hình ảnh
 * @returns {Promise<{ url: string, publicId?: string }>}
 */
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/file-upload/cdn", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response?.data || response;
};

/**
 * Tải nhiều file ảnh cùng lúc lên Cloudinary CDN
 * API: POST /api/file-upload/cdn/multiple
 * @param {FileList|File[]} files Danh sách tệp ảnh
 * @returns {Promise<Array<{ url: string, publicId?: string }>>}
 */
const uploadFileMultiple = async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    const response = await axios.post("/file-upload/cdn/multiple", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response?.data || response;
};

export {
    uploadFile,
    uploadFileMultiple
};