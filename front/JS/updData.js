// Функция обновления данных в бд
export async function updData(whatUpd, whereUpd, value, id) {

  try {
    const response = await fetch("http://localhost:3000/api/upd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whatUpd,
        whereUpd,
        value,
        id,
      }),
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`Ошибка: ${error.message}</div>`);
  }
}