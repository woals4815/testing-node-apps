// Testing Authentication API Routes

// 🐨 import the things you'll need
// 💰 here, I'll just give them to you. You're welcome
import axios from 'axios';
import {resetDb} from 'utils/db-utils';
import * as generate from 'utils/generate';
import {handleRequestFailure, getData, resolve} from 'utils/async';
import startServer from '../start';
import * as usersDB from '../db/users';

// 🐨 you'll need to start/stop the server using beforeAll and afterAll
// 💰 This might be helpful: server = await startServer({port: 8000})

let server, api;

beforeAll(async () => {
  server = await startServer({port: 8000});
  const baseURL = 'http://localhost:8000/api';
  api = axios.create({baseURL});
  api.interceptors.response.use(getData, handleRequestFailure);
});

afterAll(() => {
  server.close();
});

beforeEach(() => resetDb());

// 🐨 beforeEach test in this file we want to reset the database

test('auth flow', async () => {
  // 🐨 get a username and password from generate.loginForm()
  const {username, password} = generate.loginForm();
  // register
  // 🐨 use axios.post to post the username and password to the registration endpoint
  // 💰 http://localhost:8000/api/auth/register
  const rData = await api.post('/auth/register', {
    username,
    password,
  });

  expect(rData.user).toEqual({
    token: expect.any(String),
    id: expect.any(String),
    username,
  });

  //
  // 🐨 assert that the result you get back is correct
  // 💰 it'll have an id and a token that will be random every time.
  // You can either only check that `result.data.user.username` is correct, or
  // for a little extra credit 💯 you can try using `expect.any(String)`
  // (an asymmetric matcher) with toEqual.
  // 📜 https://jestjs.io/docs/en/expect#expectanyconstructor
  // 📜 https://jestjs.io/docs/en/expect#toequalvalue
  //
  // login
  // 🐨 use axios.post to post the username and password again, but to the login endpoint

  const lData = await api.post('/auth/login', {
    username,
    password,
  });
  expect(lData.user).toEqual(rData.user);
  // 🐨 assert that the result you get back is correct
  // 💰 tip: the data you get back is exactly the same as the data you get back
  // from the registration call, so this can be done really easily by comparing
  // the data of those results with toEqual
  //
  // authenticated request
  // 🐨 use axios.get(url, config) to GET the user's information
  const mData = await api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${lData.user.token}`,
    },
  });

  expect(mData.user).toEqual(lData.user);
  // 💰 This request must be authenticated via the Authorization header which
  // you can add to the config object: {headers: {Authorization: `Bearer ${token}`}}
  // Remember that you have the token from the registration and login requests.
  //
  // 🐨 assert that the result you get back is correct
  // 💰 (again, this should be the same data you get back in the other requests,
  // so you can compare it with that).
});

test('username must be unique', async () => {
  const username = generate.username();
  await usersDB.insert(generate.buildUser({username}));

  const error = await api
    .post('auth/register', {
      username,
      password: 'Nancy-is-#1',
    })
    .catch(resolve);

  expect(error).toMatchInlineSnapshot(
    `[Error: 400: {"message":"username taken"}]`,
  );
});

test('get me unauthenticated returns error', async () => {
  const error = await api.get('auth/me').catch(resolve);
  expect(error).toMatchInlineSnapshot(
    `[Error: 401: {"code":"credentials_required","message":"No authorization token was found"}]`,
  );
});

test('username required to register', async () => {
  const error = await api
    .post('auth/register', {password: generate.password()})
    .catch(resolve);
  expect(error).toMatchInlineSnapshot(
    `[Error: 400: {"message":"username can't be blank"}]`,
  );
});

test('password required to register', async () => {
  const error = await api
    .post('auth/register', {username: generate.username()})
    .catch(resolve);
  expect(error).toMatchInlineSnapshot(
    `[Error: 400: {"message":"password can't be blank"}]`,
  );
});

test('username required to login', async () => {
  const error = await api
    .post('auth/login', {password: generate.password()})
    .catch(resolve);
  expect(error).toMatchInlineSnapshot(
    `[Error: 400: {"message":"username can't be blank"}]`,
  );
});

test('password required to login', async () => {
  const error = await api
    .post('auth/login', {username: generate.username()})
    .catch(resolve);
  expect(error).toMatchInlineSnapshot(
    `[Error: 400: {"message":"password can't be blank"}]`,
  );
});

test('user must exist to login', async () => {
  const error = await api
    .post('auth/login', generate.loginForm({username: '__will_never_exist__'}))
    .catch(resolve);
  expect(error).toMatchInlineSnapshot(
    `[Error: 400: {"message":"username or password is invalid"}]`,
  );
});
