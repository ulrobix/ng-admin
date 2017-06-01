export default function maDuplicatedValueField() { 'ngInject';
    return {
        scope: {
            'type': '@',
            'step': '@?',
            'field': '&',
            'value': '=',
            'entry': '='
        },
        restrict: 'E',
        compile: function compile(tElement, tAttrs, transclude) {
            return {
                pre: function(scope, element) {
                    var field = scope.field();
                    scope.name = field.name();
                    scope.v = field.validation();
                    scope.sourceField = field.sourceField();
                    scope.duplicateOptionLabel = field.duplicateOptionLabel();
                    var input = element.children()[0];
                    var attributes = field.attributes();
                    for (var name in attributes) {
                        if (name === 'step') { // allow to use `step` attribute instead of `scope.step`
                            scope.step = attributes[name];
                            continue;
                        }

                        input.setAttribute(name, attributes[name]);
                    }

                    var deregister = null;
                    scope.duplicateOption = scope.value == scope.entry.values[scope.sourceField];
                    scope.$watch('duplicateOption', (newValue) => {
                        if (newValue) {
                            deregister = scope.$watch('entry.values[sourceField]', (newValue) => {
                                scope.value = newValue;
                            });
                        } else {
                            deregister && deregister();
                        }
                    });
                }
            };
        },
        template: `
<input type="{{ type || 'text' }}" ng-attr-step="{{ step }}" ng-model="value"
       id="{{ name }}" name="{{ name }}" class="form-control"
       ng-required="v.required" ng-minlength="v.minlength" ng-maxlength="v.maxlength" ng-pattern="v.pattern" ng-readonly="duplicateOption" />
<div class="checkbox">
    <label>
        <input type="checkbox" ng-model="duplicateOption"/> {{ duplicateOptionLabel | translate }}
    </label>
</div>
`
    };
}