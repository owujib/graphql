const express = require('express');
const expressGraphQl = require('express-graphql').graphqlHTTP;
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require('graphql');

const authors = [
  { id: 1, name: 'J. K. Rowling' },
  { id: 2, name: 'J. R. R. Tolkien' },
  { id: 3, name: 'Brent Weeks' },
];

const books = [
  { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
  { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
  { id: 3, name: 'Harry Potter and the Goble of Fire', authorId: 1 },
  { id: 4, name: 'Harry Potter and the Order of the Phoenix', authorId: 1 },
  { id: 5, name: 'The Fellowship of the Ring', authorId: 2 },
  { id: 6, name: 'The Two Towers', authorId: 2 },
  { id: 7, name: 'The Return of the King', authorId: 2 },
  { id: 8, name: 'The Way of the Shadows', authorId: 3 },
  { id: 9, name: 'Beyond the Shadows', authorId: 3 },
];

const app = express();
// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: 'HelloGraph',
//     fields: () => ({
//       message: {
//         type: GraphQLString,
//         resolve: () =>
//           'Hello World I am learning Graphql and it is interesting 😀',
//       },
//     }),
//   }),
// });

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'this represents a book wrtten by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (parent) => {
        return authors.find((author) => author.id === parent.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'this represents an author of a book ',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (parent) => {
        return books.filter((book) => book.authorId === parent.id);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    books: {
      type: new GraphQLList(BookType),
      description: 'List of all books',
      resolve: () => books,
    },

    book: {
      type: BookType,
      description: 'Query Type for single book',
      args: {
        type: GraphQLInt,
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of all authors',
      resolve: () => authors,
    },

    author: {
      type: AuthorType,
      description: 'Query Type for single author',
      args: {
        type: GraphQLInt,
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root mutation for books',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Add a Book',
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString),
        },
        authorId: {
          type: GraphQLNonNull(GraphQLInt),
        },
        resolve: (parent, args) => {
          const book = {
            id: books.length + 1,
            name: args.name,
            author: args.authorId,
          };
          books.push(book);
          return book;
        },
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  '/graphql',
  expressGraphQl({
    graphiql: true,
    schema,
  }),
);
app.listen(5000, () => {
  console.log('graphql server is running on localhost');
});
