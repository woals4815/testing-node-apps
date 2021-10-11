// Testing Controllers

// 🐨 you'll need a few of the generaters from test/utils/generate.js
// 💰 remember, you can import files in the test/utils directory as if they're node_modules
// import {
//   buildBook,
//   buildNext,
//   buildReq,
//   buildUser,
//   buildListItem,
//   buildRes,
// } from 'utils/generate';

// 🐨 getListItem calls `expandBookData` which calls `booksDB.readById`
// so you'll need to import the booksDB from '../../db/books'
// import * as booksDB from '../../db/books';

// 🐨 don't forget to import the listItemsController from '../list-items-controller'
// here, that's the thing we're testing afterall :)
// import * as listItemsController from '../list-items-controller';

// 🐨 use jest.mock to mock '../../db/books' because we don't actually want to make
// database calls in this test file.

// jest.mock('../../db/books');

// 🐨 ensure that all mock functions have their call history cleared using
// jest.resetAllMocks here as in the example.
// beforeEach(() => {
//   jest.clearAllMocks();
// });

// test('getListItem returns the req.listItem', async () => {
//   // 🐨 create a user
//   const user = buildUser();
//   // 🐨 create a book
//   const book = buildBook();

//   // 🐨 create a listItem that has the user as the owner and the book
//   // 💰 const listItem = buildListItem({ownerId: user.id, bookId: book.id})
//   const listItem = buildListItem({ownerId: user.id, bookId: book.id});
//   // 🐨 mock booksDB.readById to resolve to the book
//   // 💰 use mockResolvedValueOnce
//   booksDB.readById.mockResolvedValueOnce(book);
//   // 🐨 make a request object that has properties for the user and listItem
//   // 💰 checkout the implementation of getListItem in ../list-items-controller
//   // to see how the request object is used and what properties it needs.
//   // 💰 and you can use buildReq from utils/generate
//   // 🐨 make a response object
//   // 💰 just use buildRes from utils/generate
//   const req = buildReq({user, listItem});
//   const res = buildRes();
//   await listItemsController.getListItem(req, res);
//   // 🐨 make a call to getListItem with the req and res (`await` the result)
//   // 🐨 assert that booksDB.readById was called correctly
//   expect(booksDB.readById).toHaveBeenCalledWith(book.id);
//   expect(booksDB.readById).toHaveBeenCalledTimes(1);
//   //🐨 assert that res.json was called correctly
//   expect(res.json).toHaveBeenCalledWith({
//     listItem: {...listItem, book},
//   });
//   expect(res.json).toHaveBeenCalledTimes(1);
// });

import {
  buildBook,
  buildUser,
  buildReq,
  buildRes,
  buildListItem,
  buildNext,
} from 'utils/generate';

import * as booksDb from '../../db/books';

import * as listItemsController from '../list-items-controller';

import * as listItemsDB from '../../db/list-items';

jest.mock('../../db/books');

beforeEach(() => {
  jest.clearAllMocks();
});

test('getListItem returns req.listItem', async () => {
  const user = buildUser();
  const book = buildBook();
  booksDb.readById.mockResolvedValueOnce(book);
  const listItem = buildListItem({ownerId: user.id, bookId: book.id});
  const req = buildReq({user, listItem});
  const res = buildRes();

  await listItemsController.getListItem(req, res);

  expect(booksDb.readById).toHaveBeenCalledWith(book.id);
  expect(booksDb.readById).toBeCalledTimes(1);

  expect(res.json).toHaveBeenCalledWith({
    listItem: {
      ...listItem,
      book,
    },
  });
  expect(res.json).toHaveBeenCalledTimes(1);
});

test('createListItem returns 400, No bookId provided ', async () => {
  const req = buildReq();
  const res = buildRes();
  await listItemsController.createListItem(req, res);

  expect(res.json).toHaveBeenCalledWith({message: `no bookId provided`});
  expect(res.json).toHaveBeenCalledTimes(1);
  expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "no bookId provided",
      },
    ]
  `);
  expect(res.status).toHaveBeenCalledWith(400);
});

jest.mock('../../db/list-items.js');

test('setListItem sets the listItem on the req', async () => {
  const user = buildUser();
  const listItem = buildListItem({ownerId: user.id});
  const req = buildReq({user, params: {id: listItem.id}});
  const next = buildNext();
  const res = buildRes();
  listItemsDB.readById.mockResolvedValueOnce(listItem);
  await listItemsController.setListItem(req, res, next);

  expect(listItemsDB.readById).toHaveBeenCalledTimes(1);
  expect(listItemsDB.readById).toHaveBeenCalledWith(listItem.id);

  expect(next).toHaveBeenCalledWith();
  expect(next).toHaveBeenCalledTimes(1);

  expect(req.listItem).toBe(listItem);
});

test('setListItem returns 404 error if the list item doesnt exist', async () => {
  listItemsDB.readById.mockResolvedValueOnce(null);
  const fakeListItemId = 'FAKE_ID';
  const req = buildReq({params: {id: fakeListItemId}});
  const res = buildRes();
  const next = buildNext();

  await listItemsController.setListItem(req, res, next);

  expect(listItemsDB.readById).toHaveBeenCalledTimes(1);
  expect(listItemsDB.readById).toHaveBeenCalledWith(fakeListItemId);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.status).toHaveBeenCalledTimes(1);

  expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "no list item was found with the id of FAKE_ID",
      },
    ]
  `);
  expect(res.json).toHaveBeenCalledTimes(1);
  expect(next).not.toBeCalled();
});

test('setListItem returns 403 error', async () => {
  const fakeUserId = 'FAKE_USER_ID';
  const fakeOwnerId = 'FAKE_OWNER_ID';
  const fakeListItemId = 'FAKE_LISTITEM_ID';
  const user = buildUser({id: fakeUserId});
  const req = buildReq({user, params: {id: fakeListItemId}});
  const res = buildRes();
  const next = buildNext();
  //user id 와 ownwer id 를 다르게 해서 403 error throw
  const listItem = buildListItem({ownerId: fakeOwnerId, id: fakeListItemId});
  listItemsDB.readById.mockResolvedValueOnce(listItem);

  await listItemsController.setListItem(req, res, next);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "User with id FAKE_USER_ID is not authorized to access the list item FAKE_LISTITEM_ID",
      },
    ]
  `);
  expect(next).not.toHaveBeenCalled();
  expect(listItemsDB.readById).toHaveBeenCalledWith(fakeListItemId);
  expect(listItemsDB.readById).toHaveBeenCalledTimes(1);
});

test('getListItems returns a user list items', async () => {
  const user = buildUser();
  const books = [buildBook(), buildBook()];
  const listItems = [
    buildListItem({ownerId: user.id, bookId: books[0].id}),
    buildListItem({ownerId: user.id, bookId: books[1].id}),
  ];
  const req = buildReq({user});
  const res = buildRes();

  booksDb.readManyById.mockResolvedValueOnce(books);
  listItemsDB.query.mockResolvedValueOnce(listItems);

  await listItemsController.getListItems(req, res);

  expect(booksDb.readManyById).toHaveBeenCalledWith([books[0].id, books[1].id]);
  expect(booksDb.readManyById).toHaveBeenCalledTimes(1);

  expect(listItemsDB.query).toHaveBeenCalledTimes(1);
  expect(listItemsDB.query).toHaveBeenCalledWith({ownerId: user.id});

  expect(res.json).toHaveBeenCalledWith({
    listItems: [
      {
        ...listItems[0],
        book: books[0],
      },
      {
        ...listItems[1],
        book: books[1],
      },
    ],
  });
  expect(res.json).toHaveBeenCalledTimes(1);
});

test('createListItem creates and returns a list item', async () => {
  const user = buildUser();
  const book = buildBook();
  const createListItem = buildListItem({ownerId: user.id, bookId: book.id});
  const req = buildReq({user, body: {bookId: book.id}});
  const res = buildRes();
  listItemsDB.query.mockResolvedValueOnce([]);
  listItemsDB.create.mockResolvedValueOnce(createListItem);
  booksDb.readById.mockResolvedValueOnce(book);

  await listItemsController.createListItem(req, res);

  expect(res.json).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledWith({
    listItem: {
      ...createListItem,
      book,
    },
  });

  expect(booksDb.readById).toHaveBeenCalledTimes(1);
  expect(booksDb.readById).toHaveBeenCalledWith(book.id);

  expect(listItemsDB.query).toHaveBeenCalledTimes(1);
  expect(listItemsDB.query).toHaveBeenCalledWith({
    ownerId: user.id,
    bookId: book.id,
  });

  expect(listItemsDB.create).toHaveBeenCalledTimes(1);
  expect(listItemsDB.create).toHaveBeenCalledWith({
    ownerId: user.id,
    bookId: book.id,
  });
});

test('createListItem returns 400 error', async () => {
  const user = buildUser({id: 'FAKE_USER_ID'});
  const book = buildBook({id: 'FAKE_BOOK_ID'});
  const listItem = buildListItem({bookId: book.id, ownerId: user.id});
  const req = buildReq({body: {bookId: book.id}, user});
  const res = buildRes();
  listItemsDB.query.mockResolvedValueOnce([listItem]);

  await listItemsController.createListItem(req, res);
  expect(listItemsDB.query).toHaveBeenCalledWith({
    ownerId: user.id,
    bookId: book.id,
  });
  expect(listItemsDB.query).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledTimes(1);
  expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "User FAKE_USER_ID already has a list item for the book with the ID FAKE_BOOK_ID",
      },
    ]
  `);

  expect(res.status).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(400);
});
