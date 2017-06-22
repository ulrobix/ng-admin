import angular from 'angular';
import Chart from 'chart.js';
import Utils from '../misc/Utils';

export default class maChartController {
    constructor($scope, $rootScope, $element, FieldFormatter, $location, $stateParams, $anchorScroll) {
        var el = angular.element($element.children()[0]).children()[0];

        this.$scope = $scope;

        this.chart = $scope.chart = $scope.chart();
        this.entries = $scope.entries = $scope.entries();
        this.datastore = $scope.datastore = $scope.datastore();

        this.FieldFormatter = FieldFormatter;

        this.valueField = this.getField(this.chart.valueField());
        this.valueFieldName = this.valueField.name();

        this.api = new Chart(el, {
            type: $scope.chart.chartType,
            options: this.buildOptions()
        });

        var self = this;

        function update() {
            self.api.data = self.buildData();
            self.api.update();
        };

        $rootScope.$on('$translateChangeSuccess', update);

        update();
    }

    getField(fieldName) {
        let field = this.chart.getField(fieldName);
        if (!field) {
            throw new Error('Field \'' + fieldName + '\' not found');
        }
        return field;
    }

    buildData() {
        let self = this;

        let labelField = this.getField(this.chart.labelField());
        let labelFieldName = labelField.name();
        let labelComparator = Utils.directedComparator(labelField.comparator(), labelField.reverseOrder());

        let datasetField = this.chart.datasetField();
        let datasetFieldName = null;
        let datasetComparator = () => 0;
        if (datasetField) {
            datasetField = this.getField(datasetField);
            datasetFieldName = datasetField.name();
            datasetComparator = Utils.directedComparator(datasetField.comparator(), datasetField.reverseOrder());
        }

        let labels = [];
        let datasets = [];
        let values = [];

        angular.forEach(this.entries, (entry) => {
            let label = entry.values[labelFieldName];
            let dataset = datasetFieldName ? entry.values[datasetFieldName] : 'default';

            Utils.addToSet(labels, label, labelComparator);
            Utils.addToSet(datasets, dataset, datasetComparator);
        });

        angular.forEach(this.entries, (entry) => {
            let label = entry.values[labelFieldName];
            let dataset = datasetFieldName ? entry.values[datasetFieldName] : 'default';

            let labelIndex = Utils.binarySearch(labels, label, labelComparator);
            let datasetIndex = Utils.binarySearch(datasets, dataset, datasetComparator);

            let value = entry.values[this.valueFieldName];
            if (!values.hasOwnProperty(datasetIndex)) {
                values[datasetIndex] = [];
            }
            values[datasetIndex][labelIndex] = value;
        });

        let data = {
            labels: [],
            datasets: []
        };

        angular.forEach(labels, (label) => {
            let formattedLabel = this.FieldFormatter.formatFieldValue(labelField, label);
            data.labels.push(formattedLabel);
        });

        angular.forEach(datasets, (dataset, datasetIndex) => {
            let formattedDataset = 'default';
            if (datasetField) {
                formattedDataset = this.FieldFormatter.formatFieldValue(datasetField, dataset);
            }
            let datasetEl = {
                label: formattedDataset,
                data: values[datasetIndex],
            };

            let backgroundColor = this.chart.backgroundColor();
            if (backgroundColor) {
                if (angular.isArray(backgroundColor)) {
                    if (datasetIndex < backgroundColor.length) {
                        datasetEl.backgroundColor = backgroundColor[datasetIndex];
                    }
                } else {
                    datasetEl.backgroundColor = backgroundColor;
                }
            }

            let borderColor = this.chart.borderColor();
            if (borderColor) {
                if (angular.isArray(borderColor)) {
                    if (datasetIndex < borderColor.length) {
                        datasetEl.borderColor = borderColor[datasetIndex];
                    }
                } else {
                    datasetEl.borderColor = borderColor;
                }
            }

            let borderWidth = this.chart.borderWidth();
            if (borderWidth) {
                datasetEl.borderWidth = borderWidth;
            }

            angular.forEach(labels, (label, labelIndex) => {
                if (!datasetEl.data.hasOwnProperty(labelIndex)) {
                    datasetEl.data[labelIndex] = 0;
                }
            });

            data.datasets.push(datasetEl);
        });

        return data;
    }

    buildOptions() {
        let self = this;
        return angular.extend(
            {},
            {
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, chart) {
                            let dataset = chart.datasets[tooltipItem.datasetIndex];
                            let datasetLabel = dataset.label;
                            let value = dataset.data[tooltipItem.index];
                            let formattedValue = self.FieldFormatter.formatFieldValue(self.valueField, value);
                            return datasetLabel + ': ' + formattedValue;
                        }
                    }
                }
            },
            this.chart.options(),
        );
    }
}

maChartController.$inject = ['$scope', '$rootScope', '$element', 'FieldFormatter', '$location', '$stateParams', '$anchorScroll'];
