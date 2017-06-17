import maChartController from './maChartController';

export default function maChart() {
    return {
        restrict: 'E',
        scope: {
            chart: '&',
            entries: '&',
            datastore: '&',

/*
            name: '@',
            entries: '=',
            selection: '=',
            fields: '&',
            listActions: '&',
            entity: '&',
            entryCssClasses: '&?',
            datastore: '&',
            sortField: '&',
            sortDir: '&',
            sort: '&'
*/
        },
        controllerAs: 'chartController',
        controller: maChartController,
        template:
`<div class="chart-container" style="position: relative;padding:8px">
    <canvas id="chart"></canvas>
</div>`
    };
}

maChart.$inject = [];
