import axios from "axios";

const API_URL = "http://localhost:5000/auth";

export const register = async (username, password, name) => {
  console.log("Sending registration request:", { username, password, name });

  return axios.post(`${API_URL}/register`, { username, password, name });
};

export const login = async (username, password) => {
  return axios.post(`${API_URL}/login`, { username, password });
};
