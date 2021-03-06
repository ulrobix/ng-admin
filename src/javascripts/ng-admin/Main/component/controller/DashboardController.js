/**
 * @param {$scope} $scope
 * @param {$state} $state
 * @param {PanelBuilder} PanelBuilder
 * @constructor
 */
export default class DashboardController {
    constructor($scope, $state, widgets, entries, hasEntities, dataStore, $document) {
        this.$state = $state;
        this.widgets = widgets;
        this.entries = entries;
        this.hasEntities = hasEntities;
        this.datastore = dataStore;

        $scope.$document = $document;

        $scope.$on('$destroy', this.destroy.bind(this));
    }

    gotoList(entityName) {
        this.$state.go(this.$state.get('list'), { entity: entityName });
    }

    destroy() {
        this.$state = undefined;
    }
}


DashboardController.$inject = ['$scope', '$state', 'widgets', 'entries', 'hasEntities', 'dataStore', '$document'];
