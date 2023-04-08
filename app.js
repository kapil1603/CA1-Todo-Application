const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
var addDays = require("date-fns/addDays");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Start at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Server error is${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const checkRequestQueries = async (request, response, next) => {
  const { search_q, priority, status, category } = request.query;
  console.log(request.query);

  if (request.query.priority !== undefined) {
    let myPriority = request.query.priority;
    const priorityList = ["HIGH", "MEDIUM", "LOW"];
    const priorityArray = priorityList.includes(myPriority);
    console.log(priorityArray);
    if (priorityArray === true) {
      console.log(myPriority);
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (request.query.status !== undefined) {
    let myStatus = request.query.status;
    const statusList = ["TO DO", "IN PROGRESS", "DONE"];
    const statusArray = statusList.includes(myStatus);
    if (statusArray === true) {
      console.log(myStatus, "kapil");
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (request.query.category !== undefined) {
    let myCategory = request.query.category;
    const categoryList = ["WORK", "HOME", "LEARNING"];
    const categoryArray = categoryList.includes(myCategory);
    if (categoryArray === true) {
      //   console.log(request);
      //   console.log(category); // HOME
      request.category = category;
      //   console.log(request.category); //HOME
      //   console.log(myCategory); //HOME
      //   myCategory;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  next();
};

app.get("/todos/", checkRequestQueries, async (request, response) => {
  const { search_q = "", priority = "", status = "", category = "" } = request;
  console.log(search_q, priority, status, category);
  console.log(request.query);

  const getTododQuery = `SELECT
          id,todo,priority,status,category,due_date AS dueDate
      FROM
          todo
      WHERE
           todo = '%${search_q}%' AND status = '%${status}%'AND
           category = '${category}' AND priority = '%${priority}%' `;
  console.log(getTododQuery);

  const todoList = await db.all(getTododQuery);
  console.log(todoList);
  response.send(todoList);
});

// specific todo based on the todo ID API 2
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  console.log(request.params);
  const getTodosId = `
        SELECT 
            id,todo,priority,status,category,due_date AS dueDate
        FROM 
            todo            
        WHERE 
            id = ${todoId};`;

  const todo = await db.get(getTodosId);
  console.log(todo);
  response.send(todo);
});

// list of all todos with a specific due date in the query parameter API 3
app.get("/agenda/", async (request, response) => {
  const { due_date } = request.query;
  console.log(request.query);
  const getDateQuery = `SELECT due_date AS dueDate FROM todo WHERE due_date = '${due_date}'`;
  console.log(getDateQuery);
  const getDate = await db.all(getDateQuery);
  if (getDate === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    response.send(getDate);
  }
  console.log(getDate);
});

// Create a todo in the todo table API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, due_date } = request.body;
  const postTodoQuery = `INSERT INTO todo (id, todo, priority, status, category, due_date) 
  VALUES (
          ${id},  '${todo}','${priority}','${status}','${category}','${due_date}'
    )`;
  const postTodo = await db.run(postTodoQuery);
  console.log(postTodo);
  response.send("Todo Successfully Added");
});

// Updates the details of a specific todo API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updatedColumn = "";
  const requestBody = request.body;
  console.log(requestBody);

  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;

    case requestBody.priority !== undefined:
      updatedColumn = "Priority";
      break;

    case requestBody.todo !== undefined:
      updatedColumn = "Todo";
      break;

    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;

    case requestBody.category !== undefined:
      updatedColumn = "Category";
      break;

    case requestBody.dueDate !== undefined:
      updatedColumn = "Due Date";
      break;
  }

  const getUpdatedData = `SELECT * FROM todo WHERE id = '${todoId}'`;
  const getUpdated = await db.get(getUpdatedData);
  console.log(getUpdated);

  const {
    todo = getUpdated.todo,
    status = getUpdated.status,
    category = getUpdated.category,
    priority = getUpdated.priority,
    dueDate = getUpdated.due_date,
  } = request.body;
  console.log(request.body);

  const updatedData = `UPDATE todo 
    SET (todo = '${todo}',status = '${status}',category = '${category}',priority = '${priority}',dueDate = '${dueDate}')`;
  console.log(updatedData);
  console.log("kapil");
  console.log(await db.run(updatedData));
  response.send(`${updatedColumn} Updated`);
});

//  Deletes a todo from the todo table API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoId = `
    DELETE FROM todo WHERE id = ${todoId}`;
  await db.run(getTodoId);
  response.send("Todo Deleted");
});
