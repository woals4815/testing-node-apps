// Testing Middleware

// 💣 remove this todo test (it's only here so you don't get an error about missing tests)

// 🐨 you'll need both of these:
import {UnauthorizedError} from 'express-jwt';
import {buildRes, buildReq, buildNext} from 'utils/generate';
import errorMiddleware from '../error-middleware';

// 🐨 Write a test for the UnauthorizedError case
test('UnauthorizedError case', () => {
  const code = 'some_error_code';
  const message = 'some message';
  const req = buildReq();
  const res = buildRes();
  const next = buildNext();
  const error = new UnauthorizedError(code, {
    message,
  });
  //res 객체가 json에서 자기 자신을 반환하는 mock function을 가지는 이유는
  //chaining 을 위해서다.
  errorMiddleware(error, req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith({
    code: error.code,
    message: error.message,
  });
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.status).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledTimes(1);
});

// 🐨 Write a test for the headersSent case
test('headerSent true case', () => {
  const code = 'some_error_code';
  const message = 'some message';
  const req = buildReq();
  const next = buildNext();
  const error = new UnauthorizedError(code, {
    message,
  });
  //res 객체가 json에서 자기 자신을 반환하는 mock function을 가지는 이유는
  //chaining 을 위해서다.
  const res = buildRes({headersSent: true});
  errorMiddleware(error, req, res, next);
  expect(next).toHaveBeenCalledWith(error);
  expect(next).toHaveBeenCalledTimes(1);
  expect(res.json).not.toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
});

// 🐨 Write a test for the else case (responds with a 500)

test('reponds with 500 status code', () => {
  const req = buildReq();
  const next = buildNext();
  const error = new Error('errorrrr');
  const res = buildRes();
  errorMiddleware(error, req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith({
    message: error.message,
    stack: error.stack,
  });
  expect(res.json).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.status).toHaveBeenCalledTimes(1);
});
