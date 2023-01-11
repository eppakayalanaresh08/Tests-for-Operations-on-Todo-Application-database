const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const insitailzionDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
insitailzionDbAndServer();
const requestTwoCondition = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const requestOnlyPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const requestOnlyStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case requestTwoCondition(request.query):
      getQuery = `SELECT 
           * 
        FROM todo 
        WHERE todo LIKE '%${search_q}%' AND
          status='${status}'  AND       
          priority='${priority}'`;
      break;
    case requestOnlyPriority(request.query):
      getQuery = `SELECT
                    * 
                FROM todo
              WHERE todo LIKE '%${search_q}%'
              AND priority='${priority}';`;
      break;
    case requestOnlyStatus(request.query):
      getQuery = `
           SELECT 
            * 
           FROM todo
           WHERE todo LIKE '%${search_q}%'
           AND status='${status}';`;
      break;
    default:
      getQuery = `SELECT 
                * 
             FROM todo 
            WHERE todo LIKE '%${search_q}%'`;
      break;
  }
  data = await db.all(getQuery);
  response.send(data);
});
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const DatabaseSqlite = `
        SELECT 
           * 
        FROM todo 
        WHERE id=${todoId};
    `;
  const responseData = await db.get(DatabaseSqlite);
  response.send(responseData);
});

app.post("/todos/", async (request, response) => {
  const bodyRequest = request.body;
  const { id, todo, priority, status } = bodyRequest;
  const DatabaseSqlite = `
         INSERT INTO 
            todo(id,todo,priority,status)
         VALUES(
             '${id}',
             '${todo}',
             '${priority}',
             '${status}'
         )
    `;
  const responseData = await db.run(DatabaseSqlite);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const bodyRequest = request.body;
  let updateValue = "";
  switch (true) {
    case bodyRequest.status !== undefined:
      updateValue = "Status";
      break;
    case bodyRequest.priority !== undefined:
      updateValue = "Priority";
      break;
    case bodyRequest.todo !== undefined:
      updateValue = "Todo";
      break;
  }
  const uniqueDatabase = `SELECT 
        *
     FROM todo
     WHERE id=${todoId}
     `;
  const dataResponse = await db.get(uniqueDatabase);
  const {
    todo = dataResponse.todo,
    priority = dataResponse.priority,
    status = dataResponse.status,
  } = request.body;
  ///   const {id,todo,priority,status}=bodyRequest;
  const DatabaseSqlite = `
     UPDATE todo
      SET 
       todo='${todo}',
       priority='${priority}',
       status='${status}'
      WHERE id=${todoId};
    `;
  responseData = await db.run(DatabaseSqlite);
  response.send(`${updateValue} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const DatabaseSql = `
       DELETE FROM 
        todo
       WHERE id=${todoId};
         `;
  const responseDelete = await db.run(DatabaseSql);
  response.send("Todo Deleted");
});
module.exports = app;
