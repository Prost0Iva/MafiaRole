export async function checkUser(name, password) {
  try {
    const response = await fetch("http://localhost:3000/api/uscheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        password,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Ошибка: ${error.message}`);
    return { success: false, error: error.message };
  }
}