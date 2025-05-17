import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

//Logging Middleware

// Auth Middleware

// Routes

// Error Handling Middleware

const server = http.createServer(app);

// Start the server
const port = process.env.PORT || 3300;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
