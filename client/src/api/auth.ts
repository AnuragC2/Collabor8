import { client } from './client';

export const loginAPI = async (email: string, password: string) => {
  const { data } = await client.post("/auth/login", { email, password });
  return data.tokens; // { accessToken, refreshToken }
};

export const registerAPI = async (name: string, email: string, password: string) => {
  const { data } = await client.post("/auth/register", { name, email, password });
  return data;
};
