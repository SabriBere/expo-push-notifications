export const getAllNews = async () => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_URL");
  }

  try {
    const response = await fetch(`${apiBaseUrl}/news/getAll`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getAllNews:", error);
    throw error;
  }
};
