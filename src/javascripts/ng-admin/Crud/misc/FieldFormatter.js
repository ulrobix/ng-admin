import angular from 'angular';

export default class FieldFormatter {
    constructor($filter) {
        this.formatDate = function (format) {
            return function (date) {
                return $filter('date')(date, format);
            };
        };
        this.formatNumber = function (format) {
            return function (number) {
                return $filter('numeraljs')(number, format);
            };
        };

        this.formatReference = function(choices) {
            return function (value) {
                return choices[value];
            }
        }

        this.formatChoice = function(choices) {
            return function (value) {
                return $filter('translate')(choices[value]);
            }
        }
    }

    getFormatter(field, datastore) {
        var type = field.type();
        switch (type) {
            case 'boolean':
            case 'string':
            case 'text':
            case 'email':
            case 'file':
                return (value) => value;
            case 'number':
            case 'float':
                return this.formatNumber(field.format());
            case 'date':
            case 'datetime':
                var format = field.format();
                if (!format) {
                    format = type === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss';
                }

                return this.formatDate(format);
            case 'reference':
            case 'reference_many':
                let refChoices = datastore.getReferenceChoicesById(field);
                return this.formatReference(refChoices);
            case 'choice':
            case 'choices':
                let choices = {};
                angular.forEach(field.choices(), (choice) => {
                    choices[choice.value] = choice.label;
                });
                return this.formatChoice(choices);
            default:
                throw Error(`Value formatting for '${type}' field type is not supported`);
        }
    }

}

FieldFormatter.$inject = ['$filter'];
