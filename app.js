const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

dbPath = path.join(__dirname, "todoApplication.db");

const initializeDbAndServer = async () => {
  try {
    db = await { filename: dbPath, driver: sqlite3.Database };
    app.listen(3000, () => {
      console.log("Server Start at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Server error is${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const statusTodo = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const priorityHigh = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const priorityHighAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const categoryAndStatusDone = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const categoryHome = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const categoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status, category, dueDate } = request.query;
  console.log(request.query, status);
  console.log(search_q);

  switch (true) {
    case statusTodo(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND status = '${status}' `;
      console.log(getTodoQuery);
      break;

    // case priorityHigh(request.query):
    //   getTodoQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND priority = '${priority}' `;
    //   break;

    // case priorityHighAndStatus(request.query):
    //   getTodoQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND status = '${status}' AND priority = '${priority}'`;
    //   break;

    // case categoryAndStatusDone(request.query):
    //   getTodoQuery = `SELECT * FROM todo WHERE todo LIKE  "%${search_q}%" AND category = '${category} AND status = '${status}' `;
    //   break;

    // case categoryHome(request.query):
    //   getTodoQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND category = '${category}' `;
    //   break;

    // case categoryAndPriority(request.query):
    //   getTodoQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND category = '${category}' AND priority = '${priority}' `;
    //   break;

    default:
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE  "%${search_q}%" `;
      break;
  }
  data = await db.all(getTodosQuery);
  console.log(data);
  response.send(data);
});
