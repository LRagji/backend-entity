export class filterBuilder {

    constructor(operatorMap) {

        this.addOperatorConditionFor = this.addOperatorConditionFor.bind(this);
        this.removeOperatorConditionFor = this.removeOperatorConditionFor.bind(this);
        this.sortByConditionFor = this.sortByConditionFor.bind(this);
        this.removeSortByConditionFor = this.removeSortByConditionFor.bind(this);

        this._addConditions = this._addConditions.bind(this);
        this._removeConditions = this._removeConditions.bind(this);


        this._singleOperandsOperators = Object.entries(operatorMap).filter(kvp => kvp[1] === "singleOperand").map(kvp => kvp[0]);
        this._multiOperandsOperators = Object.entries(operatorMap).filter(kvp => kvp[1] === "multiOperand").map(kvp => kvp[0]);
        this._ascendingOperator = Object.entries(operatorMap).filter(kvp => kvp[1] === "asc").map(kvp => kvp[0])[0];
        this._descendingOperator = Object.entries(operatorMap).filter(kvp => kvp[1] === "desc").map(kvp => kvp[0])[0];
    }

    addOperatorConditionFor(filterObject, operator, propertyName, propertyValue) {

        let isSingle = this._singleOperandsOperators.indexOf(operator) >= 0;
        let isMulti = this._multiOperandsOperators.indexOf(operator) >= 0;
        if (isMulti === false && isSingle === false) throw new Error(operator + " is not a operator, or is not defined.")
        if (isMulti & isSingle === true) throw new Error(operator + " is not Invalid operator, or operator defination is incorrect.")

        return this._addConditions(filterObject, operator, propertyName, propertyValue, isSingle, isMulti);
    }

    removeOperatorConditionFor(filterObject, operator, propertyName, propertyValue) {

        let isSingle = this._singleOperandsOperators.indexOf(operator) >= 0;
        let isMulti = this._multiOperandsOperators.indexOf(operator) >= 0;
        if (isMulti === false && isSingle === false) throw new Error(operator + " is not a operator, or is not defined.")
        if (isMulti & isSingle === true) throw new Error(operator + " is not Invalid operator, or operator defination is incorrect.")

        return this._removeConditions(filterObject, operator, propertyName, propertyValue, isSingle, isMulti);
    }

    sortByConditionFor(filterObject, propertyName, ascending, priority) {

        return this._addConditions(filterObject, ascending === true ? this._ascendingOperator : this._descendingOperator, propertyName, priority, true, false);
    }

    removeSortByConditionFor(filterObject, propertyName, ascending, priority) {

        return this._removeConditions(filterObject, ascending === true ? this._ascendingOperator : this._descendingOperator, propertyName, priority, true, false);
    }

    _addConditions(filterObject, operator, propertyName, propertyValue, isSingle, isMulti) {
        if (filterObject[operator] === undefined) {
            //Operator is not defined
            filterObject[operator] = {};
            if (isSingle === true) filterObject[operator][propertyName] = propertyValue;
            if (isMulti === true) filterObject[operator][propertyName] = [propertyValue];
        }
        else {
            //Operator is defined but this property is not defined
            //OR
            //Operator is defined property is also defined still overwrite the value to what we have.
            if (isSingle === true) filterObject[operator][propertyName] = propertyValue;
            if (isMulti === true) {
                if (filterObject[operator][propertyName] === undefined)
                    filterObject[operator][propertyName] = [propertyValue];
                else
                    filterObject[operator][propertyName].push(propertyValue);
            }
        }
        return filterObject;
    }

    _removeConditions(filterObject, operator, propertyName, propertyValue, isSingle, isMulti) {
        if (filterObject[operator] === undefined) {
            //Operator is not defined
        }
        else {
            if (filterObject[operator][propertyName] === undefined) {
                //Operator is defined but this property is not defined
            }
            else {
                //Operator is defined property is also defined still overwrite the value to what we have.
                if (isSingle === true) delete filterObject[operator][propertyName];
                if (isMulti === true) {
                    let idx = filterObject[operator][propertyName].indexOf(propertyValue);
                    if (idx >= 0) {
                        filterObject[operator][propertyName].splice(idx, 1);
                    }
                    if (filterObject[operator][propertyName].length === 0) delete filterObject[operator][propertyName];
                }
            }
            if (Object.keys(filterObject[operator]).length === 0)
                delete filterObject[operator];
        }
        return filterObject;
    }

}