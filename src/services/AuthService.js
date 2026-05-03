import axios from "../config/AxiosConfig";

const login = async (email, password) => {
    try {
        const data = {
            email,
            password
        };
        const response = await axios.post("/auth/login", data);
        return response;
    } catch (error) {
        throw error;
    }
}


export {
    login
}