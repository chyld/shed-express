import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import homeRouter from './app/routes/home.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Serve static files
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', homeRouter)

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
