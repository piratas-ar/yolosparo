yolosparo
=========

Campaña para parar la ley de hidrocarburos que promueve el fracking en Argentina

## Installation

```
$ npm install
$ node index.js

App available at http://localhost:3000
```

The application uses *express.js* as the web framework and *handlebars* as the
template engine.

## Mapping new endpoints

* Create a file with the endpoint name in the ```app/``` directory.
* Map the endpoint using the express framework available as the ```app``` global
variable. For instance:

File **app/endpoint.js**
```
// Renders my endpoint.
app.get('/endpoint', function(req, res) {
  var model = {
    message: "Hello world!"
  };

  // ...
  // Code to initialize the model.
  // ...

  res.render("endpoint.html", model);
});

```

Refer to express.js documentation for further information:

http://expressjs.com/4x/api.html#application

* Create the view file in the ```views/``` directory. It uses the default
layout, which is ```views/layouts/main.html```.

File **views/endpoint.html***
```
<html>
  <head>
    <title>My endpoint</title>
  </head>
  <body>
    <!-- Renders the message from the model. -->
    <h1>You've sent a message: {{message}}</h1>
  </body>
</html>
```

