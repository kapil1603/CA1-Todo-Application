const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const toDate = require("date-fns/toDate");

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
  console.log(request.query); // { priority: 'HIGH' }

  if (request.query.search_q !== undefined) {
    request.search_q = search_q;
  }

  if (request.query.priority !== undefined) {
    let myPriority = request.query.priority; // HIGH
    const priorityList = ["HIGH", "MEDIUM", "LOW"];
    const priorityArray = priorityList.includes(myPriority);
    console.log(priorityArray);
    if (priorityArray === true) {
      console.log(priority);
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (request.query.status !== undefined) {
    let myStatus = request.query.status;
    console.log("k");
    const statusList = ["TO DO", "IN PROGRESS", "DONE"];
    const statusArray = statusList.includes(myStatus);
    console.log(statusArray);
    if (statusArray === true) {
      console.log("kapil");
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }

    //   if (status !== undefined) {
    // statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    // statusIsInArray = statusArray.includes(status);
    // if (statusIsInArray === true) {
    //   request.status = status;
    // } else {
    //   response.status(400);
    //   response.send("Invalid Todo Status");
    //   return;
    // }
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

const checkRequestsBody = (request, response, next) => {
  const { id, todo, category, priority, status, dueDate } = request.body;
  const { todoId } = request.params;

  if (category !== undefined) {
    categoryArray = ["WORK", "HOME", "LEARNING"];
    categoryIsInArray = categoryArray.includes(category);
    if (categoryIsInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    priorityArray = ["HIGH", "MEDIUM", "LOW"];
    priorityIsInArray = priorityArray.includes(priority);
    if (priorityIsInArray === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    statusIsInArray = statusArray.includes(status);
    if (statusIsInArray === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (dueDate !== undefined) {
    try {
      const myDate = new Date(dueDate);
      const formatedDate = format(new Date(dueDate), "yyyy-MM-dd");
      console.log(formatedDate);
      const result = toDate(new Date(formatedDate));
      const isValidDate = isValid(result);
      console.log(isValidDate);
      console.log(isValidDate);
      if (isValidDate === true) {
        request.dueDate = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  request.todo = todo;
  request.id = id;

  request.todoId = todoId;

  next();
};

app.get("/todos/", checkRequestQueries, async (request, response) => {
  const { search_q = "", priority = "", status = "", category = "" } = request;
  console.log(search_q, priority, status, category, "kumar");
  //   console.log(request);

  const getTodoQuery = `
        SELECT 
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
        FROM 
            todo   
        WHERE 
        todo LIKE '%${search_q}%' AND priority LIKE '%${priority}%' 
        AND status LIKE '%${status}%' AND category LIKE '%${category}%';`;
  console.log(getTodoQuery);

  const todoList = await db.all(getTodoQuery);
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
  //   const { due_date } = request.query;
  //   console.log(request.query);
  //   console.log(date);
  try {
    const myDate = new Date(request.query.date);
    console.log(myDate);
    const formatedDate = format(new Date(myDate), "yyyy-MM-dd");
    console.log(formatedDate);
    const result = toDate(new Date(formatedDate));
    console.log(result);
    const isValidDate = isValid(result);
    console.log(isValidDate);
    if (isValidDate === true) {
      const { due_date } = request.query;
      console.log(request.query);

      const getDateQuery = `SELECT id, todo, priority, status, category,due_date AS dueDate FROM todo
   WHERE due_date = '${formatedDate}'`;
      console.log(getDateQuery);
      const getDate = await db.all(getDateQuery);
      response.send(getDate);
      console.log(getDate);
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } catch (e) {
    response.status(400);
    // response.send(`${e.message}`);  // resuformatedDatelt is not defined
    response.send("Invalid Due Date");
    return;
  }

  //   console.log(formatedDate);
});

// Create a todo in the todo table API 4
app.post("/todos/", checkRequestsBody, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request;
  const postTodoQuery = `INSERT INTO todo (id, todo, priority, status, category, due_date) 
  VALUES (
          ${id},  '${todo}','${priority}','${status}','${category}','${dueDate}'
    )`;
  const postTodo = await db.run(postTodoQuery);
  console.log(postTodo);
  response.send("Todo Successfully Added");
});

// Updates the details of a specific todo API 5
app.put("/todos/:todoId/", checkRequestsBody, async (request, response) => {
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
    SET todo = '${todo}',status = '${status}',category = '${category}',priority = '${priority}',due_date = '${dueDate}'`;
  console.log(updatedData);
  console.log("kapil");
  await db.run(updatedData);
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

module.exports = app;
