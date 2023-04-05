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
      console.log("priorityArray");
      return myPriority;
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
      return myStatus;
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
