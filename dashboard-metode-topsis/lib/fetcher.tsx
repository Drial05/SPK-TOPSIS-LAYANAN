import { getCookie } from "cookies-next";

export const fetcherSWR = async (url: string) => {
  const token = getCookie("token");

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch scores");
  return res.json();
};
