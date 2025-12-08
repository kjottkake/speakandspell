export async function getUserData (token) {
  const response = await fetch(`api/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.ok) {
    const userData = await response.json();
    return userData;
  } else {
    console.error("Failed to fetch user data", response);
    throw new Error("Failed to fetch user data");
  }
};