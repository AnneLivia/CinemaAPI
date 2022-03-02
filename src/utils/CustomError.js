/* eslint-disable max-classes-per-file */
class GeneralError extends Error {
  // Server Error = 500 = There was an error on the server and the request could not be completed
  constructor(message, statusCode = 500, listOfErrors = undefined) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    // if there's an extra field in res which specifies a list of errors,
    // such as the one received when using Joi, then, put it here.
    this.listOfErrors = listOfErrors;
  }
}

class BadRequest extends GeneralError {
  constructor(message, listOfErrors) {
    super(message, 400, listOfErrors);
  }
}

class NotFound extends GeneralError {
  constructor(message, listOfErrors) {
    super(message, 404, listOfErrors);
  }
}
class Unauthorized extends GeneralError {
  constructor(message, listOfErrors) {
    super(message, 401, listOfErrors);
  }
}
class Forbidden extends GeneralError {
  constructor(message, listOfErrors) {
    super(message, 403, listOfErrors);
  }
}

export {
  GeneralError,
  BadRequest,
  NotFound,
  Unauthorized,
  Forbidden,
};
