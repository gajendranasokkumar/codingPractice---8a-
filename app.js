const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

app.use(express.json())

const initDbandStart = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is Started!!')
    })
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

initDbandStart()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

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
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const q2 = `SELECT * FROM todo WHERE id = ${todoId}`
  const result = await db.get(q2)
  response.send(result)
})

app.post('/todos/', async (request, response) => {
  let dic = request.body
  const {id, todo, priority, status} = dic
  const q3 = `INSERT INTO todo (id, todo, priority, status) VALUES (${id}, '${todo}', '${priority}', '${status}');`
  await db.run(q3)
  response.send('Todo Successfully Added')
})

const hasTodo = requestQ => {
  return requestQ.todo !== undefined
}

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let dic = request.body
  let getTodosQuery = ''
  switch (true) {
    case hasTodo(request.body):
      getTodosQuery = `UPDATE todo SET todo = '${dic.todo}' WHERE id = '${todoId}'`
      break
    case hasPriorityProperty(request.body):
      getTodosQuery = `UPDATE todo SET priority = '${dic.priority}' WHERE id = '${todoId}'`
      break
    case hasStatusProperty(request.body):
      getTodosQuery = `UPDATE todo SET status = '${dic.status}' WHERE id = '${todoId}'`
      break
    default:
      getTodosQuery = ``
  }

  await db.run(getTodosQuery)
  response.send('Todo Updated')
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const q5 = `DELETE FROM todo WHERE id = ${todoId}`
  await db.run(q5)
  response.send('Todo Deleted')
})
