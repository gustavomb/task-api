# Task API
Demo API for task management.

## Dependencies
* A running instance of PostgreSQL.

## Running

* Copy the [.env.example](.env.example) file to .env:\
`cp .env.example .env`

* Configure the DATABASE_URL to match your PostgreSQL instance:\
`postgresql://postgres:postgres@localhost:5432`\
The URI format is defined in the [PostgreSQL libpq documentation](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING).

* Alternatively you can spin up a PostgreSQL instance with the provided [docker-compose](docker-compose.yaml) file.\
Within the project directory, run the following command:
    * To start instance: `docker-compose up -d`
    * To stop instance: `docker-compose down`

* Install depencencies:\
`yarn` or `npm install`

* Initialize the database with Prisma migrations:\
`npx prisma migrate deploy`

* Run the server:\
`yarn start`or `npm start`