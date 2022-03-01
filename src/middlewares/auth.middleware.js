import unless from "express-unless";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {

  const { authorization } = req.headers;

  if (!authorization)
    return res.status(401).json({ message: "Authorization not found" });

  const [, token] = authorization.split(" ");

  try {

    const payload = jwt.verify(token, JWT_SECRET);
    req.userLogged = payload;

  } catch (error) {

    console.error(error);
    return res.status(401).json({ message: "Invalid token" });

  }

  next();

};

// in order to support unless function from express-unless
authMiddleware.unless = unless;

export default authMiddleware;
