export default function maReferenceColumn() {
    return {
        restrict: 'E',
        scope: {
            field: '&',
            value: '&',
            datastore: '&'
        },
        link: {
            pre: function(scope) {
                const value = scope.value();
                scope.field = scope.field();
                scope.targetEntity = scope.field.targetEntity();
                scope.targetField = scope.field.targetField();
                const identifierName = scope.targetEntity.identifier().name();
                scope.referencedEntry = scope.datastore()
                    .getFirstEntry(scope.targetEntity.uniqueId + '_values', function (entry) {
                        return entry.values[identifierName] == value;
                    });
            }
        },
        template: '<ma-column field="::targetField" entry="::referencedEntry" entity="::targetEntity" datastore="::datastore()"></ma-column>'
    };
}

maReferenceColumn.$inject = [];
