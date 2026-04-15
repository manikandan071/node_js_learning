const db = require("../../shared/db");

exports.getAllTasks = async (data) => {
  const { id, email } = data;
  const [rows] = await db.execute("SELECT * FROM tasks WHERE user_id = ?", [
    id,
  ]);
  return { Status: "200", message: "All tasks fetched.", rows };
};

exports.createTask = async (data, userId) => {
  const { title, description, status, priority, due_date } = data;

  await db.execute(
    `INSERT INTO tasks (title,description,status,priority,due_date,user_id)
     VALUES (?,?,?,?,?,?)`,
    [title, description, status, priority, due_date, userId],
  );

  return { Status: "200", message: "Task created" };
};

exports.updateTask = async (id, data) => {
  await db.execute(`UPDATE tasks SET ? WHERE id=?`, [data, id]);
  return { Status: "200", message: "Task updated" };
};
