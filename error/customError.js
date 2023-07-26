class MainError extends Error {
  constructor(code, message) {
    super();
    this.name = this.constructor.name;
    this.statusCode = code;
    this.message = message;
  }
}

class AuthenticationError extends MainError {}
class UserError extends MainError {}
class BookError extends MainError {}
class RequestError extends MainError {}

module.exports = { MainError, AuthenticationError, UserError, BookError, RequestError };
