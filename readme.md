
# backend-entity
Simple, minimalist entity framework for [Postgre](https://www.postgresql.org/) wtih [node](http://nodejs.org).

## Usage with Postge
```js
let eType = require('backend-entity').entity;
 let propertyMap = {
            "id": "id",     //Key: Name of the property on the object,Value is the name of the column in PG.
            "name": "name",
        };

        this._entity = new eType("entityname", propertyMap, pgPool); //This is used as your table name
```

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install backend-entity
```


## Features

  * Filter Builder to create dynamic where conditions.


## Known Limitations

  * Supports only postgresql in the backend
  * Doesnt support JSON data type in postgre.

## Operator Supported
|  Operator | SQL Operator  | Description  |
|---|---|---|
| =  | equal  |  Single Operand Only, compares value is equal. |
| !=  | notequal  |  Single Operand Only, compares value is not equal. |
|   |   |   |