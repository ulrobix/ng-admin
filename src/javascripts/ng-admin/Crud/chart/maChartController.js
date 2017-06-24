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

        this.initializeFieldParameters();

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

    getFieldLabel(field) {
        let label = field.label();
        return label ? this.$filter('translate')(label) : field.name();
    }

    initializeFieldParameters() {
        this.labelField = this.getField(this.chart.labelField());
        this.labelFieldName = this.labelField.name();
        this.labelFormatter = this.FieldFormatter.getFormatter(this.labelField, this.datastore);
        this.labelComparator = this.FieldComparatorFactory.create(this.labelField, this.datastore);
        this.labelFieldLabel = this.getFieldLabel(this.labelField);

        this.valueField = this.getField(this.chart.valueField());
        this.valueFieldName = this.valueField.name();
        this.valueFormatter = this.FieldFormatter.getFormatter(this.valueField, this.datastore);
        this.valueFieldLabel = this.getFieldLabel(this.valueField);

        this.datasetField = this.chart.datasetField();
        if (this.datasetField) {
            this.datasetField = this.getField(this.datasetField);
            this.datasetFieldName = this.datasetField.name();
            this.datasetFormatter = this.FieldFormatter.getFormatter(this.datasetField, this.datastore);
            this.datasetComparator = this.FieldComparatorFactory.create(this.datasetField, this.datastore);
            this.datasetFieldLabel = this.getFieldLabel(this.datasetField);
        } else {
            this.datasetFieldName = null;
            this.datasetComparator = () => 0;
            this.datasetFormatter = (value) => this.datasetLabel;
            this.datasetLabel = this.valueFieldLabel;
        }

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

        let labels = [];
        let datasets = [];
        let valueTable = [];
        let entryTable = this.entryTable = [];

        angular.forEach(this.entries, (entry) => {
            let label = entry.values[this.labelFieldName];
            let dataset = this.datasetFieldName ? entry.values[this.datasetFieldName] : this.valueField.name();

            Utils.addToSet(labels, label, this.labelComparator);
            Utils.addToSet(datasets, dataset, this.datasetComparator);
        });

        angular.forEach(this.entries, (entry) => {
            let label = entry.values[this.labelFieldName];
            let dataset = this.datasetFieldName ? entry.values[this.datasetFieldName] : this.valueField.name();

            let labelIndex = Utils.binarySearch(labels, label, this.labelComparator);
            let datasetIndex = Utils.binarySearch(datasets, dataset, this.datasetComparator);

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
            let formattedLabel = this.labelFormatter(label);
            data.labels.push(formattedLabel);
        });

        angular.forEach(datasets, (dataset, datasetIndex) => {
            let formattedDataset = this.datasetFormatter(dataset);
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
            this.chart.options(),
            this.buildTooltips()
        );
    }

    buildTooltips() {
        let self = this;
        let callback = this.chart.tooltip();
        let tooltip = {};
        return {
            tooltips: {
                callbacks: {
                    beforeTitle: function (tooltipItem, chart) {
                        tooltipItem = tooltipItem[0];
                        let dataset = chart.datasets[tooltipItem.datasetIndex];
                        let entry = dataset.entries[tooltipItem.index];
                        tooltip = self.getDefaultTooltip(self, tooltipItem, chart);
                        if (callback) {
                            callback(entry, tooltip, self, tooltipItem, chart);
                            if (!tooltip.title) {
                                self.assignTooltipTitle(tooltip);
                            }
                            if (!tooltip.body) {
                                self.assignTooltipBody(tooltip);
                            }
                        }
                    },
                    title: function () {
                        return tooltip.title;
                    },
                    label: function () {
                        return tooltip.body;
                    },
                }
            }
        };

    }

    getDefaultTooltip(ctrl, tooltipItem, chartData) {
        let labelFieldValue = chartData.labels[tooltipItem.index];
        let dataset = chartData.datasets[tooltipItem.datasetIndex];
        let datasetFieldValue = dataset.label;
        let value = dataset.data[tooltipItem.index];
        let formattedValue = ctrl.valueFormatter(value);
        let tooltip = {
            label: { label: ctrl.labelFieldLabel, value: labelFieldValue },
            dataset: { label: ctrl.datasetFieldLabel, value: datasetFieldValue },
            value: { label: ctrl.valueFieldLabel, value: formattedValue }
        };
        this.assignTooltipTitle(tooltip);
        this.assignTooltipBody(tooltip);

        return tooltip;
    }

    assignTooltipTitle(tooltip) {
        tooltip.title = tooltip.label.label;
        if (tooltip.title) {
            tooltip.title += ': ';
        } else {
            tooltip.title = '';
        }
        tooltip.title += tooltip.label.value;
        tooltip.title = [ tooltip.title ];
        if (this.datasetField) {
            let dataset = tooltip.dataset.label;
            if (dataset) {
                dataset += ': ';
            } else {
                dataset = '';
            }
            dataset += tooltip.dataset.value;
            tooltip.title.push(dataset);
        }
    }

    assignTooltipBody(tooltip) {
        tooltip.body = tooltip.value.label;
        if (tooltip.body) {
            tooltip.body += ': ';
        } else {
            tooltip.body = '';
        }
        tooltip.body += tooltip.value.value;
    }
}


maChartController.$inject = ['$scope', '$rootScope', '$element', 'FieldFormatter', 'FieldComparatorFactory', '$filter'];
