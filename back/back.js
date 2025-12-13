import express from "express";
import mysql from "mysql2";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

// В начало файла после импортов
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Включаем подробное логирование для отладки
app.use((req, res, next) => {
  console.log('\n=== Новый запрос ===');
  console.log('Время:', new Date().toISOString());
  console.log('Метод:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Cookie в заголовках:', req.headers.cookie);
  console.log('Session ID из cookie:', req.sessionID);
  next();
});

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Разрешаем любой origin для отладки
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, credentials');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    name: 'mafia.sid', // Явно задаем имя cookie
    secret: "kasane_teto",
    resave: true,  // меняем на true
    saveUninitialized: true,  // меняем на true
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
      httpOnly: false, // Разрешаем доступ из JavaScript
      sameSite: 'none', // Меняем на 'none'
      path: '/',
      domain: 'localhost' // Явно указываем домен
    }
  })
);
app.use((req, res, next) => {
  // Убеждаемся, что cookie устанавливается
  if (req.sessionID && !req.headers.cookie) {
    console.log('Устанавливаем cookie для сессии:', req.sessionID);
    res.cookie('mafia.sid', req.sessionID, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: false,
      secure: false,
      sameSite: 'none',
      path: '/'
    });
  }
  next();
});

// Статические файлы - отдаем файлы из корневой папки проекта
app.use(express.static(path.join(__dirname, "..")));

// Подключение к БД
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

// API маршруты
app.post("/api/find", async (req, res) => {
  const { whatFind, whereFind, byWhat, value } = req.body;

  console.log("Получен запрос:", { whatFind, whereFind, byWhat, value });

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

app.post("/api/add", async (req, res) => {
  const { whereAdd, whatAdd = [], values = [] } = req.body;

  console.log("Получен запрос:", { whereAdd, whatAdd, values });

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

app.post("/api/del", async (req, res) => {
  const { whereDel, whatDel = [], values = [] } = req.body;

  console.log("Получен запрос:", { whereDel, whatDel, values });

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

app.post("/api/upd", async (req, res) => {
  const { whatUpd, whereUpd, value, id } = req.body;

  console.log("Получен запрос:", { whatUpd, whereUpd, value, id });

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

// Регистрация нового пользователя
app.post("/api/register", async (req, res) => {
  const { name, password } = req.body;

  console.log("Получен запрос на регистрацию:", { name, password });

  if (!name || !password) {
    return res.status(400).json({
      success: false,
      error: "Не указаны имя или пароль"
    });
  }

  if (name.length < 3 || name.length > 16) {
    return res.json({
      success: false,
      error: "Имя должно быть от 3 до 16 символов"
    });
  }

  if (password.length < 8 || password.length > 16) {
    return res.json({
      success: false,
      error: "Пароль должен быть от 8 до 16 символов"
    });
  }

  try {
    // Проверяем, не занято ли имя
    const [existingUsers] = await connection.query(
      "SELECT id FROM user WHERE name = ?",
      [name]
    );

    if (existingUsers.length > 0) {
      return res.json({
        success: false,
        error: "Имя пользователя уже занято"
      });
    }

    // Создаем нового пользователя
    const [result] = await connection.query(
      "INSERT INTO user (name, password, role) VALUES (?, ?, 'user')",
      [name, password]
    );

    // Автоматически логиним пользователя
    req.session.user = {
      id: result.insertId,
      name: name,
      role: 'user'
    };

    console.log("Пользователь зарегистрирован:", req.session.user);
    res.json({ 
      success: true, 
      user: req.session.user,
      message: "Регистрация успешна" 
    });

  } catch (err) {
    console.error("Ошибка SQL:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Вход пользователя - упрощенная версия
app.post("/api/uscheck", async (req, res) => {
  const { name, password } = req.body;

  console.log('=== /api/uscheck ===');
  console.log('Попытка входа:', { name });

  try {
    const [users] = await connection.query(
      "SELECT * FROM user WHERE name = ?",
      [name]
    );

    if (users.length === 0) {
      return res.json({ 
        success: false, 
        message: "Пользователь не найден" 
      });
    }

    const user = users[0];

    if (user.password !== password) {
      return res.json({ 
        success: false, 
        message: "Неверный пароль" 
      });
    }

    // Сохраняем пользователя в сессии
    req.session.user = {
      id: user.id,
      name: user.name,
      role: user.role
    };

    // Явно устанавливаем cookie
    res.cookie('mafia.sid', req.sessionID, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: false,
      secure: false,
      sameSite: 'none',
      path: '/'
    });

    console.log('✅ Пользователь авторизован:', req.session.user);
    console.log('Session ID:', req.sessionID);
    console.log('Установленные cookies:', res.getHeaders()['set-cookie']);

    res.json({ 
      success: true, 
      user: req.session.user,
      message: "Авторизация успешна" 
    });

  } catch (err) {
    console.error('❌ Ошибка SQL:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});
// Проверка авторизации
app.post("/api/auth/check", async (req, res) => {
  console.log('=== /api/auth/check ===');
  console.log('Полная сессия:', req.session);
  console.log('User в сессии:', req.session.user);
  console.log('Session ID:', req.sessionID);
  console.log('Cookies из запроса:', req.headers.cookie);
  
  if (req.session.user) {
    console.log('Пользователь авторизован');
    res.json({ 
      authenticated: true, 
      user: req.session.user 
    });
  } else {
    console.log('Пользователь НЕ авторизован');
    res.json({ 
      authenticated: false,
      debug: {
        sessionExists: !!req.session,
        sessionID: req.sessionID,
        hasUser: !!req.session.user
      }
    });
  }
});

// Выход из аккаунта
app.post("/api/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Ошибка удаления сессии:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Ошибка сервера" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Выход выполнен успешно" 
    });
  });
});

// ТЕСТОВЫЙ маршрут для проверки работы сервера
app.get("/api/test", (req, res) => {
  res.json({ message: "Сервер работает!" });
});


// ========== API ДЛЯ КАРТОЧЕК ==========

// Получение всех карточек
app.post("/api/cards/get", async (req, res) => {
  console.log("Получен запрос на получение карточек");
  
  try {
    // Получаем все карточки с именами авторов
    const [results] = await connection.query(`
      SELECT c.*, u.name as author_name 
      FROM card c 
      LEFT JOIN user u ON c.user_id = u.id 
      ORDER BY c.date DESC
    `);
    
    console.log("Найдено карточек:", results.length);
    res.json({ success: true, cards: results });
    
  } catch (err) {
    console.error("Ошибка получения карточек:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Создание новой карточки
app.post("/api/cards/create", async (req, res) => {
  const { name, description, user_id } = req.body;
  
  console.log("Создание карточки:", { name, description, user_id });
  
  if (!name || !description || !user_id) {
    return res.status(400).json({
      success: false,
      error: "Не указаны обязательные поля"
    });
  }
  
  try {
    // Проверяем существование пользователя
    const [users] = await connection.query(
      "SELECT id, name FROM user WHERE id = ?",
      [user_id]
    );
    
    if (users.length === 0) {
      return res.json({
        success: false,
        error: "Пользователь не найден"
      });
    }
    
    const user = users[0];
    
    // Создаем карточку
    const [result] = await connection.query(
      "INSERT INTO card (name, description, author, date, user_id) VALUES (?, ?, ?, NOW(), ?)",
      [name, description, user.name, user_id]
    );
    
    console.log("Карточка создана, ID:", result.insertId);
    
    res.json({
      success: true,
      card: {
        id: result.insertId,
        name: name,
        description: description,
        author: user.name,
        date: new Date().toISOString().split('T')[0],
        user_id: user_id
      }
    });
    
  } catch (err) {
    console.error("Ошибка создания карточки:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Обновление карточки
app.post("/api/cards/update", async (req, res) => {
  const { card_id, name, description, user_id } = req.body;
  
  console.log("Обновление карточки:", { card_id, name, description, user_id });
  
  if (!card_id || !name || !description) {
    return res.status(400).json({
      success: false,
      error: "Не указаны обязательные поля"
    });
  }
  
  try {
    // Проверяем права доступа
    const [cards] = await connection.query(
      "SELECT user_id FROM card WHERE id = ?",
      [card_id]
    );
    
    if (cards.length === 0) {
      return res.json({
        success: false,
        error: "Карточка не найдена"
      });
    }
    
    const card = cards[0];
    
    // Проверяем, является ли пользователь автором или админом
    const [users] = await connection.query(
      "SELECT role FROM user WHERE id = ?",
      [user_id]
    );
    
    if (users.length === 0) {
      return res.json({
        success: false,
        error: "Пользователь не найден"
      });
    }
    
    const user = users[0];
    
    if (card.user_id !== user_id && user.role !== 'admin') {
      return res.json({
        success: false,
        error: "Нет прав для редактирования этой карточки"
      });
    }
    
    // Обновляем карточку
    await connection.query(
      "UPDATE card SET name = ?, description = ? WHERE id = ?",
      [name, description, card_id]
    );
    
    // Получаем обновленную карточку
    const [updatedCards] = await connection.query(`
      SELECT c.*, u.name as author_name 
      FROM card c 
      LEFT JOIN user u ON c.user_id = u.id 
      WHERE c.id = ?
    `, [card_id]);
    
    res.json({
      success: true,
      card: updatedCards[0]
    });
    
  } catch (err) {
    console.error("Ошибка обновления карточки:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Удаление карточки
app.post("/api/cards/delete", async (req, res) => {
  const { card_id, user_id } = req.body;
  
  console.log("Удаление карточки:", { card_id, user_id });
  
  if (!card_id || !user_id) {
    return res.status(400).json({
      success: false,
      error: "Не указаны обязательные поля"
    });
  }
  
  try {
    // Проверяем права доступа
    const [cards] = await connection.query(
      "SELECT user_id FROM card WHERE id = ?",
      [card_id]
    );
    
    if (cards.length === 0) {
      return res.json({
        success: false,
        error: "Карточка не найдена"
      });
    }
    
    const card = cards[0];
    
    // Проверяем, является ли пользователь админом
    const [users] = await connection.query(
      "SELECT role FROM user WHERE id = ?",
      [user_id]
    );
    
    if (users.length === 0) {
      return res.json({
        success: false,
        error: "Пользователь не найден"
      });
    }
    
    const user = users[0];
    
    if (user.role !== 'admin') {
      return res.json({
        success: false,
        error: "Только администратор может удалять карточки"
      });
    }
    
    // Удаляем карточку
    await connection.query(
      "DELETE FROM card WHERE id = ?",
      [card_id]
    );
    
    console.log("Карточка удалена, ID:", card_id);
    
    res.json({
      success: true,
      message: "Карточка успешно удалена"
    });
    
  } catch (err) {
    console.error("Ошибка удаления карточки:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Статические файлы раздаются из: ${path.join(__dirname, "..")}`);
});