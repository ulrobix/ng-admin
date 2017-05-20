export default function maReferencedListColumnActions() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            'field': '&',
            'buttons': '&',
            'entry': '&',
            'targetEntries': '=',
            'entity': '&'
        },
        link: function ($scope) {
            $scope.buttons = $scope.buttons();
            $scope.field = $scope.field();
            $scope.entry = $scope.entry();
            $scope.entity = $scope.entity();
//            $scope.targetEntity = $scope.field.targetEntity();
            $scope.customTemplate = false;
            if (typeof $scope.buttons === 'string') {
                $scope.customTemplate = $scope.buttons;
                $scope.buttons = null;
            } else {
                $scope.defaultValues = {};
                $scope.defaultValues[$scope.field.targetReferenceField()] = $scope.entry.values[$scope.entity.identifier().name()];
            }
        },
        template:
            `<span compile="customTemplate">
    <span ng-repeat="button in ::buttons" ng-switch="button">
        <ma-create-button ng-switch-when="create" entity="::targetEntity" default-values="defaultValues" size="xs"></ma-create-button>
        <span ng-switch-default><span compile="button"></span></span>
    </span>
</span>`
    };
}
