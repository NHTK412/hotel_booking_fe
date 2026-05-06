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

export {
    uploadFile
};