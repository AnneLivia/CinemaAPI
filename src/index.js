import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/routes.js";

import authMiddleware from "./middlewares/auth.middleware.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// using middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// using unless to conditionally skip a middleware when a condition is met
app.use(authMiddleware.unless({ 
  path: [
    // when used the string in url: "/api/login", if I request /api/login/, the route is not going to be skipped. 
    // that's why I'm using regex to match (api/login) independently of the '/' after it
    // escape '\' in '\/' allows to use the '/' in regex. 
    { url: /api\/login/ },
    { url: /api\/users/, methods: ['POST'] }
  ]  
}));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Cinema API" });
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}.`);
});
