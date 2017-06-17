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
    }

    formatField(field, entry) {
        var type = field.type();
        switch (type) {
            case 'boolean':
            case 'choice':
            case 'choices':
            case 'string':
            case 'text':
            case 'wysiwyg':
            case 'email':
            case 'json':
            case 'file':
                return entry.values[field.name()];
            case 'template':
                return field.getTemplateValue(entry);
            case 'number':
            case 'float':
                var formatNumber = this.formatNumber(field.format());
                return formatNumber(entry.values[field.name()]);
            case 'date':
            case 'datetime':
                var format = field.format();
                if (!format) {
                    format = type === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss';
                }

                var formatDate = this.formatDate(format);
                return formatDate(entry.values[field.name()]);
            case 'reference':
                return entry.listValues[field.name()];
            case 'reference_many':
                return entry.listValues[field.name()].join(', ');
            case 'referenced_list':
                return; //ignored
        }
    }
}

FieldFormatter.$inject = ['$filter'];
