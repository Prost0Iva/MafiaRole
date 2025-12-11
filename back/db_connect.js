import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Подключение 
let connection;
async function connectToDatabase() {
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456iva',
            database: 'mafiarole',
            port: 3306 
        }).promise();
        
        console.log('Успешно подключено к MySQL');
        return connection;
    } catch (error) {
        console.error('Ошибка подключения:', error);
        throw error;
    }
}
connectToDatabase();

// Обработка POST запросов данных из бд
app.post("/api/find", async (req, res) => {
  const { whatFind, whereFind, byWhat, value } = req.body;

  console.log("Получен запрос:", { whatFind, whereFind, byWhat, value });

  // Проверка обязательных полей
  if (!whatFind || !whereFind) {
    return res
      .status(400)
      .json({ error: "Не указаны обязательные поля: whatFind, whereFind" });
  }

  let sql = `SELECT ${whatFind} FROM ${whereFind}`;
  const params = [];

  if (byWhat && value) {
    sql += ` WHERE ${byWhat} = ?`;
    params.push(value);
  }

  console.log("Выполняем SQL:", sql);
  console.log("Параметры:", params);

  try {
    const [results] = await connection.query(sql, params);
    console.log("Результаты:", results);
    res.json(results);
  } 
  catch (err) {
    console.error("Ошибка SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

// Обработка POST добавления данных в бд
app.post("/api/add", async (req, res) => {
  const { whereAdd, whatAdd = [], values = [] } = req.body;

  console.log("Получен запрос:", { whereAdd, whatAdd, values });

  // Проверка обязательных полей
  if (!whereAdd || !whatAdd || !values) {
    return res.status(400).json({
      error: "Не указаны обязательные поля: whereAdd, whatAdd, values",
    });
  }

  let add = []
  for(let element of values) {
    add.push('"' + element + '"');
  }
  let sql = `INSERT into ${whereAdd}(${whatAdd})values(${add})`;
  const params = [];

  console.log("Выполняем SQL:", sql);

  try {
    const [results] = await connection.query(sql, params);
    console.log("Результаты:", results);
    res.json(results);
  } 
  catch (err) {
    console.error("Ошибка SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

// Обработка POST удаления данных из бд
app.post("/api/del", async (req, res) => {
  const { whereDel, whatDel = [], values = [] } = req.body;

  console.log("Получен запрос:", { whereDel, whatDel, values });

  // Проверка обязательных полей
  if (!whereDel || !whatDel || !values) {
    return res.status(400).json({
      error: "Не указаны обязательные поля: whereDel, whatDel, values",
    });
  }

  let sql = `DELETE FROM ${whereDel} WHERE ${whatDel} = ${values}`;
  const params = [];

  console.log("Выполняем SQL:", sql);

  try {
    const [results] = await connection.query(sql, params);
    console.log("Результаты:", results);
    res.json(results);
  } 
  catch (err) {
    console.error("Ошибка SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

// Обработка POST обновления данных в бд
app.post("/api/upd", async (req, res) => {
  const { whatUpd, whereUpd, value, id } = req.body;

  console.log("Получен запрос:", { whatUpd, whereUpd, value, id });

  // Проверка обязательных полей
  if (!whatUpd || !whereUpd) {
    return res
      .status(400)
      .json({ error: "Не указаны обязательные поля: whatUpd, whereUpd" });
  }

  let upd = []
  for(let i = 0; i < whereUpd.length; i++) {
    upd.push(whereUpd[i] + '="' + value[i] + '"')
  }
  let sql = `UPDATE ${whatUpd} SET ${upd} WHERE id = '${id}'`;
  const params = [];

  console.log("Выполняем SQL:", sql);
  console.log("Параметры:", params);

  try {
    const [results] = await connection.query(sql, params);
    console.log("Результаты:", results);
    res.json(results);
  } 
  catch (err) {
    console.error("Ошибка SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Тестовый URL: http://localhost:${PORT}/api/test`);
});