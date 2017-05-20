export default function maReferenceField(ReferenceRefresher) {
    return {
        scope: {
            'field': '&',
            'value': '=',
            'entry':  '=',
            'datastore': '&?'
        },
        restrict: 'E',
        link: function(scope) {
            const field = scope.field();
            const identifierName = field.targetEntity().identifier().name()
            scope.name = field.name();
            scope.v = field.validation();

            if (!field.remoteComplete()) {
                // fetch choices from the datastore, populated during routing resolve
                let initialEntries = scope.datastore()
                    .getEntries(field.targetEntity().uniqueId + '_choices');
                if (scope.value) {
                    const isCurrentValueInInitialEntries = initialEntries.filter(e => e.identifierValue === scope.value).length > 0;
                    if (!isCurrentValueInInitialEntries) {
                        initialEntries.unshift(scope.datastore()
                            .getEntries(field.targetEntity().uniqueId + '_values')
                            .find(entry => entry.values[identifierName] == scope.value)
                        );
                    }
                }
                const initialChoices = initialEntries.map(entry => ({
                    value: entry.values[identifierName],
                    label: entry.values[field.targetField().name()]
                }));
                scope.$broadcast('choices:update', { choices: initialChoices });
            } else {
                let lastSearch;
                let filters = field.filters();

                // ui-select doesn't allow to prepopulate autocomplete selects, see https://github.com/angular-ui/ui-select/issues/1197
                // let ui-select fetch the options using the ReferenceRefresher
                scope.refresh = function refresh(search) {
                    lastSearch = search;
                    return ReferenceRefresher.refresh(field, scope.value, search, filters)
                        .then(function clearCurrentChoice(results) {
                            if (!search && scope.value) {
                                const isCurrentValueInEntries = results.filter(e => e.value === scope.value).length > 0;
                                if (!isCurrentValueInEntries) {
                                    scope.$apply(function() {
                                        scope.value = null;
                                    });
                                }
                            }
                            return results;
                        })
                        .then(formattedResults => {
                            scope.$broadcast('choices:update', { choices: formattedResults });
                        });
                };

                if (typeof filters === 'function') {
                    let filtersFn = filters;
                    scope.$watch(
                        function() {
                            return filtersFn(scope.entry);
                        },
                        function(newValue, oldValue) {
                            filters = newValue;
                            scope.refresh(lastSearch);
                        },
                        true
                    );
                } else {
                    scope.refresh(lastSearch);
                }

            }
        },
        template: `<ma-choice-field
                field="field()"
                datastore="datastore()"
                refresh="refresh($search)"
                value="value">
            </ma-choice-field>`
    };
}

maReferenceField.$inject = ['ReferenceRefresher'];
