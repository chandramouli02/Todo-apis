const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running in : http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//todo table create id todo priority status

//api1 senerio 1 get todo with status todo;
//3 cases query has priority and status..
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
//get todos api1
app.get("/todos/", async (request, response) => {
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  const data = await db.all(getTodosQuery);
  response.send(data);
});

//api2
//get todo by id
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoByIdQuery = `
    select * from todo
    where id = ${todoId};`;
  const data = await db.get(getTodoByIdQuery);
  response.send(data);
});

//api3
//post todo Item to todo Db
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  console.log(id, todo, priority, status);
  const insertToQuery = `
    INSERT INTO todo
    VALUES (
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
        );`;
  const dbResponse = await db.run(insertToQuery);
  response.send("Todo Successfully Added");
});

//api4 update todo items status, priority, todo
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, status, priority } = request.body;
  console.log(todoId);
  console.log(todo, status, priority);
  switch (true) {
    case todo !== undefined:
      console.log("reached todo block");
      const changeTodoQuery = `
          UPDATE todo
          SET todo = '${todo}'
          WHERE id = ${todoId};`;
      await db.run(changeTodoQuery);
      response.send("Todo Updated");
      break;
    case status !== undefined:
      console.log("reached status block");
      const changeStatusQuery = `
          UPDATE todo
          SET status = '${status}'
          WHERE id = ${todoId};`;
      await db.run(changeStatusQuery);
      response.send("Status Updated");
      break;
    default:
      console.log("reached priority case block");
      const changePriority = `
          UPDATE todo
          SET priority = '${priority}'
          WHERE id = ${todoId};`;
      await db.run(changePriority);
      response.send("Priority Updated");
      break;
  }
});

//api5 delete todo item by todoId
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
