import 'express-async-errors';

const errorMiddleware = (error, req, res, next) => {
  // If there's not an explicit instantiation of General Error or Other Error Classes
  // then we must gave a default status code.
  // One example that falls into this default '500' status is when 'Can't reach database server'

  res.status(error.statusCode || 500);

  if (error.listOfErrors) {
    return res.json({
      message: error.message,
      errors: error.listOfErrors,
    });
  }

  // only message was passed
  res.json({ message: error.message });

  // by passing the error object to the next handler
  // invokes the default error handler, which prints a stack trace.
  next(error);
};

export default errorMiddleware;
