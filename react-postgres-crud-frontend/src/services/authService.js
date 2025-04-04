import axios from "axios";

const API_URL = "http://localhost:5000/auth";

export const register = async (username, password) => {
  return axios.post(`${API_URL}/register`, { username, password });
};

export const login = async (username, password) => {
  return axios.post(`${API_URL}/login`, { username, password });
};
