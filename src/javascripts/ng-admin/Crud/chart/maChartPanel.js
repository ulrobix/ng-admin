export default function maDashboardPanel($state) {
    return {
        restrict: 'E',
        scope: {
            collection: '&',
            entries: '&',
            datastore: '&'
        },
        link: function(scope) {
            scope.gotoList = function () {
                $state.go($state.get('list'), { entity: scope.collection().entity.name() });
            };
        },
        template:
`<div class="panel-heading">
    <a href="#">{{ (collection().title() || collection().entity.label()) | translate }}</a>
</div>
<ma-chart collection="dashboardController.collections.contract_counts" entries="dashboardController.entries.contract_counts" datastore="dashboardController.datastore"></ma-chart>
`
    };
}

maDashboardPanel.$inject = ['$state'];
