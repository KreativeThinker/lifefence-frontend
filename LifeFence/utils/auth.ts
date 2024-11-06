import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "../constants/apiConfig";

export const authHelper = {
  async login(username, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed!");
    }
    const data = await response.json();
    await SecureStore.setItemAsync("token", data.access_token);
  },

  async signup(username, password, name, email, dob) {
    console.log(dob);

    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        name,
        email,
        dob,
      }),
    });

    if (!response.ok) {
      console.log(response);

      throw new Error("Signup failed!");
    }
  },

  async isAuthenticated() {
    const token = await SecureStore.getItemAsync("token");
    return token !== null;
  },

  async logout() {
    await SecureStore.deleteItemAsync("token");
  },

  async getToken() {
    return await SecureStore.getItemAsync("token");
  },
};
