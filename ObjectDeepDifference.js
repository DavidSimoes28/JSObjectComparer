let ObjectDeepDifference = function () {
    return {
        CREATED: 'created',
        UPDATED: 'updated',
        DELETED: 'deleted',
        UNCHANGED: '---',
        Map: function (oldObject, newObject, returnNewDifferences = false, path = "") {
            if (this.IsFunction(oldObject) || this.IsFunction(newObject)) {
                throw 'Invalid argument. Function given, object expected.';
            }

            if(this.IsAnyObjectValue(oldObject, newObject) && !returnNewDifferences){
                return this.GetDifferenceObject(oldObject, newObject, path);
            }else if(this.IsAnyObjectValue(oldObject, newObject) && returnNewDifferences){
                return this.GetNewDifference(oldObject, newObject);
            }

            let differences = {};
            let foundKeys = {};

            for (let key in oldObject) {
                if (this.IsFunction(oldObject[key])) {
                    continue;
                }
                
                let newValue = newObject[key] !== undefined ? newObject[key] : undefined;
                
                let mapValue = this.Map(oldObject[key], newValue, returnNewDifferences, this.GetPath(path, key));
                foundKeys[key] = true;
                if (mapValue) {
                    differences[key] = mapValue;
                }
            }

            for (let key in newObject) {
                if (this.IsFunction(newObject[key]) || foundKeys[key] !== undefined) {
                    continue;
                }

                let mapValue = this.Map(undefined, newObject[key], returnNewDifferences, this.GetPath(path, key));

                if (mapValue) {
                    differences[key] = mapValue;
                }
            }

            if (Object.keys(differences).length > 0) {
                return !returnNewDifferences ? differences : this.MapValueBeforeSave(differences);
            }

            return undefined;
        },
        GetDifferenceObject(oldObject, newObject, path){
            let returnObj = {
                path: path,
                type: this.CompareValues(oldObject, newObject),
                original: oldObject,
                updated: newObject,
            };

            if (returnObj.type !== this.UNCHANGED) {
                return returnObj;
            }
            return undefined;
        },
        GetNewDifference(oldObject, newObject){
            let type = this.CompareValues(oldObject, newObject);
            if (type !== this.UNCHANGED && type !== this.DELETED) {
                return newObject;
            }
            if (type !== this.UNCHANGED && type !== this.CREATED) {
                return null;
            }
            return undefined;
        },
        CompareValues: function (currentValue, newValue) {
            if (currentValue === newValue) {
                return this.UNCHANGED;
            }
            if (this.IsDate(currentValue) && this.IsDate(newValue) && currentValue.getTime() === newValue.getTime()) {
                return this.UNCHANGED;
            }
            if (currentValue === undefined) {
                return this.CREATED;
            }
            if (newValue === undefined) {
                return this.DELETED;
            }
            return this.UPDATED;
        },
        IsAnyObjectValue(oldObject, newObject){
            return this.IsValue(oldObject) || this.IsValue(newObject);
        },
        IsFunction: function (x) {
            return Object.prototype.toString.call(x) === '[object Function]';
        },
        IsArray: function (x) {
            return Object.prototype.toString.call(x) === '[object Array]';
        },
        IsDate: function (x) {
            return Object.prototype.toString.call(x) === '[object Date]';
        },
        IsObject: function (x) {
            return Object.prototype.toString.call(x) === '[object Object]';
        },
        IsValue: function (x) {
            return !this.IsObject(x) && !this.IsArray(x);
        },
        GetPath: function (path, key) {
            return path == "" ? key : path + "." + key;
        },
        AreAllKeysNumeric: function(obj){
            return Object.keys(obj).every((o) => !isNaN(o));
        },
        MapValueBeforeSave: function(obj){
            return this.AreAllKeysNumeric(obj) == false ? obj : this.MapObjectIntoArray(obj);
        },
        MapObjectIntoArray: function(obj){
            return Object.keys(obj)
                .map(function(key) {
                    return obj[key];
                });
        }
    }
}();