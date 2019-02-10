let fpType = require('./filterqueryparserpg').filterQueryParserPg;
let fbType = require('./filterbuilder').filterBuilder;

class entity {
    constructor(entityName, entityPropertiesMap, pgPool) {
        this._tableName = entityName;
        this._columns = entityPropertiesMap; //Array of { name: propertyName, type: sqlColumnName } TODO:Always add id as system generated column
        this._queryBuilder = new fpType(entityPropertiesMap);
        this._pgPool = pgPool;
        let operatorMap = {
            "like": "singleOperand",
            "equal": "singleOperand",
            "greaterThan": "singleOperand",
            "lessThan": "singleOperand",
            "ascending": "asc",
            "descending": "desc",
            "containsArr": "multiOperand"
        };
        this.filterBuilder = new fbType(operatorMap);

        this.createEntity = this.createEntity.bind(this);
        this.updateEntity = this.updateEntity.bind(this);
        this.readAllEntities = this.readAllEntities.bind(this);
        this.readPaginatedEntities = this.readPaginatedEntities.bind(this);
        this.readEntitiesById = this.readEntitiesById.bind(this);

        this._constructUpdateClause = this._constructUpdateClause.bind(this);
    }

    async createEntity(propertiesNamesAndValues) {
        let insertQuery = 'insert into "' + this._tableName + '"(';
        let columnsValues = [];
        let valuesCommand = "values(";

        if (Object.keys(this._columns).length <= 0) throw new Error("No columns defined for " + this._tableName + ", for insert operation.");

        Object.entries(propertiesNamesAndValues).forEach(kvp => {
            let columnName = kvp[0], columnvalue = kvp[1];
            let column = Object.keys(this._columns).filter(e => e.toLowerCase() === columnName.toLowerCase())
            if (column.length <= 0) throw new Error("No column defination for " + columnName + ", Please define column for same.");
            column = column[0];
            insertQuery += ' "' + columnName + '",';
            valuesCommand += " $" + (columnsValues.length + 1) + ",";
            columnsValues.push(columnvalue);
        });

        insertQuery = insertQuery.substring(0, insertQuery.length - 1);
        insertQuery += ")";
        valuesCommand = valuesCommand.substring(0, valuesCommand.length - 1);
        valuesCommand += ")";

        insertQuery = insertQuery + " " + valuesCommand + " RETURNING *";
        let response = await this._pgPool.query(insertQuery, columnsValues);

        return response.rows[0];
    }

    async updateEntity(id, propertiesNamesAndValues) {
        id = parseInt(id);
        let updateQuery = 'update "' + this._tableName + '" set';
        let columnsValues = [];
        let columNames = Object.keys(this._columns).map(e => e.toLowerCase());

        if (columNames.length <= 0) throw new Error("No columns defined for " + this._tableName + ", for update operation.");

        Object.entries(propertiesNamesAndValues).forEach(kvp => {
            updateQuery += this._constructUpdateClause(kvp[0], kvp[1], " ", columNames, columnsValues);
        });
        updateQuery = updateQuery.substring(0, updateQuery.length - 1);

        updateQuery += this._constructUpdateClause("id", id, " where ", columNames, columnsValues)
        updateQuery = updateQuery.substring(0, updateQuery.length - 1);
        updateQuery += " RETURNING *";

        let response = await this._pgPool.query(updateQuery, columnsValues);
        return response.rows[0];
    }

    async readPaginatedEntities(pageNo, size, filterJson) {

        pageNo = parseInt(pageNo);
        size = parseInt(size);

        if (isNaN(pageNo)) throw new Error("Invalid parameter pageNo");
        if (isNaN(size)) throw new Error("Invalid parameter size");

        let startIndex = (pageNo * size);
        let argumentArray = [(size + 1), startIndex]; //+1 is added to size is to check if there is a next page available.

        let filterClause = this._queryBuilder.constructWhereClause(filterJson, argumentArray) + this._queryBuilder.constructOrderByClause(filterJson);

        let selectQuery = 'select * from "' + this._tableName + '" ' + filterClause + ' limit $1 offset $2';
        let response = await this._pgPool.query(selectQuery, argumentArray);

        let fetchedEntities = [];
        response.rows.forEach(row => {
            let entity = row;
            fetchedEntities.push(entity)
        });

        return { "results": fetchedEntities, "moreResults": response.rows.length > (size - 1) };
    }

    async readAllEntities(filterJson) {

        let moreData = true;
        let finalresult = [];
        let page = 0, size = 500;
        while (moreData === true) {
            let result = await this.readPaginatedEntities(page, size, filterJson);
            page += 1;
            moreData = result.moreResults;
            finalresult = finalresult.concat(result.results);
        }
        return finalresult;
    }

    async readEntitiesById(id) {
        id = parseInt(id);
        let filter = this.filterBuilder.addOperatorConditionFor({}, "equal", "id", id);
        let response = await this.readPaginatedEntities(0, 1, filter);
        if (response.results.length > 0)
            return response.results[0];
        else
            return undefined;
    }

    _constructUpdateClause(columnName, columnvalue, prefixString, columnNamesArray, argumentArray) {
        let returnClause = prefixString;
        let idx = columnNamesArray.indexOf(columnName.toLowerCase());
        if (idx < 0) throw new Error("No column defination for " + columnName + ", Please define column for same.");
        columnNamesArray.splice(idx, 1);
        returnClause += '"' + columnName + '" = $' + (argumentArray.length + 1) + ",";
        argumentArray.push(columnvalue);
        return returnClause;
    }
}
module.exports = entity;