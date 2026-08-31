import axios from "axios";

const api = axios.create({
  baseURL: "https://nova-bay-backend-production.up.railway.app/api",
  withCredentials: true, // sends/receives cookies automatically - no manual token handling
});

export default api;