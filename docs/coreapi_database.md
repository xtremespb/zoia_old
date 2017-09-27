Used for Database connection.

## Constructor

`constructor(app, mongo, _session)`

* app: express instance
* mongo: MongoDB configuration (pass corresponding config.js section here)
* session: Session configuration (pass corresponding config.js section here)

**Important**: you don't need to initialize MongoDB object in your module, you can use `app.get('db')` instead to use a pre-configured object.

## Methods

`get()`

* Get the MongoDB object instance (the native driver is used)