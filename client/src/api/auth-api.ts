import { api } from "@/services/api-client";

export async function registerUser(data: any) {
    const response = await api.post("/auth/register", data);

    return response.data;
}


export const loginUser = async (data: {
    email: string;
    password: string;
}) => {
    const res = await api.post("/auth/login", data);
    return res.data;
};