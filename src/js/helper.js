import { TIMEOUT_SEC } from "./config.js";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const getJSON = async function (url) {
  try {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8", // Setting charset to utf-8
      },
    };

    const fetchPro = fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok)
      throw new Error(
        `Network response was not ok ${data.message} (${res.status})`
      );
    return data;
  } catch (error) {
    throw error;
  }
};
