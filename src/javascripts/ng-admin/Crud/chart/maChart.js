import maChartController from './maChartController';

export default function maChart() {
    return {
        restrict: 'E',
        scope: {
            chart: '&',
            entries: '&',
            datastore: '&',
        },
        controllerAs: 'chartController',
        controller: maChartController,
        template:
`<div class="chart-container" style="position: relative;padding:16px 8px 8px">
    <canvas id="chart"></canvas>
</div>`
    };
}

maChart.$inject = [];
