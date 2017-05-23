export default class ShowController {
    constructor($scope, $location, view, dataStore, $injector) {
        this.$scope = $scope;
        this.$location = $location;
        this.title = view.title();
        this.description = view.description();
        this.actions = view.actions();

        this.fields = view.fields();
        this.$scope.entry = dataStore.getFirstEntry(view.getEntity().uniqueId);
        this.$scope.view = view;
        this.view = view;
        this.entity = this.view.getEntity();
        this.dataStore = dataStore;

        $scope.$on('$destroy', this.destroy.bind(this));

        this.condition = function(field) {
            var fn = field.condition();
            if (fn) {
                var value = this.$scope.entry.values[field.name()];
                var entry = this.$scope.entry;
                var entity = this.entity;

                return $injector.invoke(
                    fn,
                    view,
                    { value, entry, entity, view, controller: this }
                );
            } else {
                return true;
            }
        }
    }

    destroy() {
        this.$scope = undefined;
        this.$location = undefined;
        this.view = undefined;
        this.entity = undefined;
        this.dataStore = undefined;
    }
}

ShowController.$inject = ['$scope', '$location', 'view', 'dataStore', '$injector'];
