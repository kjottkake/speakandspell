export async function getUserLanguages (token) {
  try {
    // Fetch l1 and l2 in parallel
    const [l1Res, l2Res] = await Promise.all([
      fetch(`api/users/get-l1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }),
      fetch(`api/users/get-l2`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
    ]);

    let l1Value = null, l2Value = null;

    if (l1Res.ok) {
      l1Value = (await l1Res.json()).l1;
    } else {
      console.error("Failed to fetch l1", l1Res);
    }

    if (l2Res.ok) {
      l2Value = (await l2Res.json()).l2;
    } else {
      console.error("Failed to fetch l2", l2Res);
    }

    return { l1: l1Value, l2: l2Value };
  } catch (error) {
    console.error("Error fetching user languages:", error);
    throw error;
  }
};