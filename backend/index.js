import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import router from './router.js';
import { addAdmin } from './controllers/authController.js';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/BHUB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
  // Once connected, add admin user
  addAdmin();
});

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,DELETE,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers,Access-Control-Allow-Methods,Origin,Accept,Content-Type,X-Requested-With,Cookie");
  res.setHeader("Access-Control-Allow-Credentials","true");
  next();
});

app.use(router);

app.listen(3002, () => {
  console.log('Listening to port 3002');
});