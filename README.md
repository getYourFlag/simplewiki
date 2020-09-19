# SimpleWiki

A nest.js backend application designed for centralized management of information and suggestions made by typical users.

## Usage

Simplewiki currently uses the nest.js scaffolding for service initialization and testing. First, download all dependencies by ```npm install```, Then start the service by ```npm run start```. If running production build is required, use ```npm run start:prod```.

You may refer to ```package.json``` to explore other npm run commands.

## Current functions

1. Submitting articles & suggestions for articles
2. Creating tags to categorize articles
3. Creating new users with different permission levels (Levels available: USER, EDITOR, ADMIN, OPERATOR).
4. Creates default user ```DEFAULT:DEFAULT``` during first launch or launching with fresh database.
5. Create custom order for articles and set the permission for viewing articles by attributes.

## Compatibility

This application uses TypeORM for database access using SQL-based syntax. Theoretically it would support all types of SQL databases that TypeORM supports. MySQL was used during development and the support for other types of SQL databases (e.g. Postgres) could not be guaranteed.

## Future Plan

1. Creating a frontend for API consumption.
2. Search articles by tag, title or content.
3. Custom recording of database updates.
4. Logging system for errors.

## License

MIT License