import { api } from "@/services/api-client";


// get pro plan info....
export async function getPlanInfo() {
    const res = await api.get("/payments/plan")
    return res.data
}