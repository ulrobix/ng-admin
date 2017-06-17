export default function maChartPanel($state) {
    return {
        restrict: 'E',
        scope: {
            chart: '&',
            entries: '&',
            datastore: '&'
        },
        link: function(scope) {
            scope.gotoList = function () {
                $state.go($state.get('list'), { entity: scope.chart().entity.name() });
            };
        },
        template:
`<div class="panel-heading">
    <a href="#">{{ (chart().title() || chart().entity.label()) | translate }}</a>
</div>
<ma-chart chart="chart()" entries="entries()" datastore="datastore()"></ma-chart>
`
    };
}

maChartPanel.$inject = ['$state'];
