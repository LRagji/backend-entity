class filterQueryParserPg {

    constructor(propertyMap) {
        this._propertyMap = propertyMap;
        this._operatorMap = {
            "like": "like",
            "equal": "=",
            "greaterThan": ">",
            "lessThan": "<",
            "ascending": "asc",
            "descending": "desc",
            "containsArr": "&&"
        };

        this.constructWhereClause = this.constructWhereClause.bind(this);
        this.constructOrderByClause = this.constructOrderByClause.bind(this);
    }

    constructWhereClause(filterObject, argumentArray) {
        let whereClause = ""

        if (!Array.isArray(argumentArray)) throw new Error("Parameter 'argumentArray' cannot be undefined, has to be of array data type.");

        Object.keys(filterObject).forEach((operator) => {

            switch (operator) {
                case 'equal':
                case 'greaterThan':
                case 'lessThan':
                    Object.keys(filterObject[operator]).forEach((operand) => {
                        whereClause += (whereClause === "" ? "" : " and ") + ' "' + this._propertyMap[operand] + '" ' + this._operatorMap[operator] + " $" + (argumentArray.length + 1);
                        argumentArray.push(filterObject[operator][operand]);
                    });
                    break;
                case 'like':
                    Object.keys(filterObject[operator]).forEach((operand) => {
                        whereClause += (whereClause === "" ? "" : " and ") + ' lower("' + this._propertyMap[operand] + '") ' + this._operatorMap[operator] + " $" + (argumentArray.length + 1);
                        argumentArray.push("%" + filterObject[operator][operand].toLowerCase() + "%");
                    });
                    break;
                case 'containsArr':
                    Object.keys(filterObject[operator]).forEach((operand) => {
                        whereClause += (whereClause === "" ? "" : " and ") + ' "' + this._propertyMap[operand] + '" ' + this._operatorMap[operator] + " $" + (argumentArray.length + 1);
                        argumentArray.push(filterObject[operator][operand]);
                    });
                    break;
                default:
                    //console.warn("New Operator found: " + operator)
                    break;
            }
        });

        return whereClause === "" ? "" : ("where " + whereClause);

    }

    constructOrderByClause(filterObject) {
        let orderClause = ""

        Object.keys(filterObject).forEach((operator) => {

            switch (operator) {
                case 'ascending':
                case 'descending':
                    Object.keys(filterObject[operator]).forEach((operand) => {
                        orderClause += (orderClause === "" ? "" : " , ") + ' "' + this._propertyMap[operand] + '" ' + this._operatorMap[operator];
                    });
                    break;
                default:
                    //console.warn("New Operator found: " + operator)
                    break;
            }
        });

        return orderClause === "" ? "" : ("order by " + orderClause);

    }


}

module.exports = filterQueryParserPg;