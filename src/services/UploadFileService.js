import axios from "../config/AxiosConfig";

const uploadFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);


        const response = await axios.post("/file-upload/cdn", formData);


        return response;
    } catch (error) {
        throw error;
    }
};

const uploadFileMultiple = async (files) => {
    try {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        const response = await axios.post("/file-upload/cdn/multiple", formData);

        return response;
    }
    catch (error) {
        throw error;
    }
};


export {
    uploadFile,
    uploadFileMultiple
};