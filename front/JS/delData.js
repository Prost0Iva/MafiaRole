// Функция удаления данных из бд
export async function delData(whereDel, whatDel = 'id', values) {

  try {
    const response = await fetch("http://localhost:3000/api/del", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whereDel,
        whatDel,
        values,
      }),
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`Ошибка: ${error.message}</div>`);
  }
}