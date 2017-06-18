import Chart from 'chart.js';

export default class maChartController {
    constructor($scope, $rootScope, $element, FieldFormatter, $location, $stateParams, $anchorScroll) {
        var el = angular.element($element.children()[0]).children()[0];

        this.$scope = $scope;

        this.chart = $scope.chart = $scope.chart();
        this.entries = $scope.entries = $scope.entries();
        this.datastore = $scope.datastore = $scope.datastore();

        this.FieldFormatter = FieldFormatter;

        this.api = new Chart(el, {
            type: $scope.chart.chartType,
            data: {
                datasets: [{}]
            },
            options: $scope.chart.options()
        });

        var self = this;

        function update() {
            var labels = self.extractLabels(self.chart.labelField());
            var data = self.extractData(self.chart.dataField());
            var backgroundColor = self.chart.backgroundColor();
            var borderColor = self.chart.borderColor();
            var borderWidth = self.chart.borderWidth();

            self.api.data.labels = labels;

            var dataset = self.api.data.datasets[0];
            dataset.data = data;
            if (backgroundColor) {
                dataset.backgroundColor = backgroundColor;
            }
            if (borderColor) {
                dataset.borderColor = borderColor;
            }
            if (borderWidth) {
                dataset.borderWidth = borderWidth;
            }

            self.api.update();
        };

        $rootScope.$on('$translateChangeSuccess', update);

        update();
    }

    extractLabels(fieldName) {
        var field = this.chart.getField(fieldName);
        if (!field) {
            throw new Error('Field \'' + fieldName + '\' not found');
        }

        return this.entries.map((entry) => {
            return this.FieldFormatter.formatField(field, entry);
        });
    }

    extractData(fieldName) {
        var field = this.chart.getField(fieldName);
        if (!field) {
            throw new Error('Field \'' + fieldName + '\' not found');
        }

        return this.entries.map((entry) => {
            return entry.values[field.name()];
        });
    }

}

maChartController.$inject = ['$scope', '$rootScope', '$element', 'FieldFormatter', '$location', '$stateParams', '$anchorScroll'];
