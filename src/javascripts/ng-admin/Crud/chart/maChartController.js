import angular from 'angular';
import Chart from 'chart.js';
import Utils from '../misc/Utils';

Chart.defaults.pie.aspectRatio = 2;

export default class maChartController {
    constructor($scope, $rootScope, $element, FieldFormatter, FieldComparatorFactory, $filter) {
        var el = angular.element($element.children()[0]).children()[0];

        this.$scope = $scope;

        this.chart = $scope.chart = $scope.chart();
        this.entries = $scope.entries = $scope.entries();
        this.datastore = $scope.datastore = $scope.datastore();

        this.FieldFormatter = FieldFormatter;
        this.FieldComparatorFactory = FieldComparatorFactory;
        this.$filter = $filter;

        this.valueField = this.getField(this.chart.valueField());
        this.valueFieldName = this.valueField.name();
        this.valueFormatter = this.FieldFormatter.getFormatter(this.valueField, this.datastore);

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
        let labelFormatter = this.FieldFormatter.getFormatter(labelField, this.datastore);
        let labelComparator = this.FieldComparatorFactory.create(labelField, this.datastore);

        let datasetField = this.chart.datasetField();
        let datasetFieldName;
        let datasetComparator;
        let datasetFormatter;
        if (datasetField) {
            datasetField = this.getField(datasetField);
            datasetFieldName = datasetField.name();
            datasetFormatter = this.FieldFormatter.getFormatter(datasetField, this.datastore);
            datasetComparator = this.FieldComparatorFactory.create(datasetField, this.datastore);
        } else {
            datasetFieldName = null;
            datasetComparator = () => 0;
            let datasetLabel = this.valueField.label();
            if (datasetLabel) {
                datasetLabel = this.$filter('translate')(this.valueField.label());
            } else {
                datasetLabel = this.valueField.name();
            }
            datasetFormatter = (value) => datasetLabel;
        }

        let labels = [];
        let datasets = [];
        let valueTable = [];
        let entryTable = this.entryTable = [];

        angular.forEach(this.entries, (entry) => {
            let label = entry.values[labelFieldName];
            let dataset = datasetFieldName ? entry.values[datasetFieldName] : this.valueField.name();

            Utils.addToSet(labels, label, labelComparator);
            Utils.addToSet(datasets, dataset, datasetComparator);
        });

        angular.forEach(this.entries, (entry) => {
            let label = entry.values[labelFieldName];
            let dataset = datasetFieldName ? entry.values[datasetFieldName] : this.valueField.name();

            let labelIndex = Utils.binarySearch(labels, label, labelComparator);
            let datasetIndex = Utils.binarySearch(datasets, dataset, datasetComparator);

            let value = entry.values[this.valueFieldName];
            if (!valueTable.hasOwnProperty(datasetIndex)) {
                valueTable[datasetIndex] = [];
                entryTable[datasetIndex] = [];
            }
            valueTable[datasetIndex][labelIndex] = value;
            entryTable[datasetIndex][labelIndex] = entry;
        });

        let data = {
            labels: [],
            datasets: []
        };

        angular.forEach(labels, (label) => {
            let formattedLabel = labelFormatter(label);
            data.labels.push(formattedLabel);
        });

        angular.forEach(datasets, (dataset, datasetIndex) => {
            let formattedDataset = datasetFormatter(dataset);
            let datasetEl = {
                label: formattedDataset,
                data: valueTable[datasetIndex],
                entries: entryTable[datasetIndex],
            };

            let backgroundColor = this.chart.backgroundColor();
            if (backgroundColor) {
                if (datasets.length > 1 && angular.isArray(backgroundColor)) {
                    if (datasetIndex < backgroundColor.length) {
                        datasetEl.backgroundColor = backgroundColor[datasetIndex];
                    }
                } else {
                    datasetEl.backgroundColor = backgroundColor;
                }
            }

            let borderColor = this.chart.borderColor();
            if (borderColor) {
                if (datasets.length > 1 && angular.isArray(backgroundColor)) {
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
                    datasetEl.entries[labelIndex] = null;
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
                            let formattedValue = self.valueFormatter(value);
                            return datasetLabel + ': ' + formattedValue;
                        }
                    }
                }
            },
            this.chart.options(),
        );
    }
}

maChartController.$inject = ['$scope', '$rootScope', '$element', 'FieldFormatter', 'FieldComparatorFactory', '$filter'];
