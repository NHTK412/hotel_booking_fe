import axios from "../config/AxiosConfig";


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