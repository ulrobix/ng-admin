import Chart from 'chart.js';

export default class maChartController {
    constructor($scope, $element, FieldFormatter, $location, $stateParams, $anchorScroll) {
        var el = angular.element($element.children()[0]).children()[0];

        this.$scope = $scope;

        this.chart = $scope.chart = $scope.chart();
        this.entries = $scope.entries = $scope.entries();
        this.datastore = $scope.datastore = $scope.datastore();

        this.FieldFormatter = FieldFormatter;

        var labels = this.extractDataset(this.chart.labelField());
        var data = this.extractDataset(this.chart.dataField());

        this.api = new Chart(el, {
            type: $scope.chart.chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: ['# of Votes', '2'],
                    data: data,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                    ],
/*
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
*/
                    borderWidth: 1
                }]
            },
            options: $scope.chart.options()
        });
/*
        $scope.entity = $scope.entity();
        this.$scope = $scope;
        this.$location = $location;
        this.$anchorScroll = $anchorScroll;
        this.datastore = this.$scope.datastore();
        this.filters = {};
        this.shouldDisplayActions = this.$scope.listActions() && this.$scope.listActions().length > 0;
        $scope.getEntryCssClasses = this.getEntryCssClasses.bind(this);
        $scope.toggleSelect = this.toggleSelect.bind(this);
        $scope.toggleSelectAll = this.toggleSelectAll.bind(this);
        this.sortField = $scope.sortField();
        this.sortDir = $scope.sortDir();
        this.sortCallback = $scope.sort() ? $scope.sort() : this.sort.bind(this);
*/
    }

    extractDataset(fieldName) {
        var field = this.chart.getField(fieldName);
        if (!field) {
            throw new Error('Field \'' + fieldName + '\' not found');
        }

        return this.entries.map((entry) => {
            return this.FieldFormatter.formatField(field, entry);
        });
    }

    /**
     * Return true if a column is being sorted
     *
     * @param {Field} field
     *
     * @returns {Boolean}
     */
    isSorting(field) {
        return this.$scope.sortField() === this.getSortName(field);
    }

    /**
     * Return 'even'|'odd' based on the index parameter
     *
     * @param {Number} index
     * @returns {string}
     */
    itemClass(index) {
        return (index % 2 === 0) ? 'even' : 'odd';
    }

    /**
     *
     * @param {Field} field
     */
    sort(field) {
        var dir = 'ASC',
            fieldName = this.getSortName(field);

        if (this.sortField === fieldName) {
            dir = this.sortDir === 'ASC' ? 'DESC' : 'ASC';
        }

        this.$location.search('sortField', fieldName);
        this.$location.search('sortDir', dir);
    }

    /**
     * Return fieldName like (view.fieldName) to sort
     *
     * @param {Field} field
     *
     * @returns {String}
     */
    getSortName(field) {
        return this.$scope.name ? this.$scope.name + '.' + field.name() : field.name();
    }

    getEntryCssClasses(entry) {
        var entryCssClasses = this.$scope.entryCssClasses;
        if (typeof entryCssClasses !== 'function') {
            return;
        }
        var getEntryCssClasses = entryCssClasses();
        if (typeof getEntryCssClasses !== 'function') {
            return;
        }
        return getEntryCssClasses(entry.values);
    }

    toggleSelect(entry) {
        var selection = this.$scope.selection.slice();

        var index = selection.indexOf(entry);

        if (index === -1) {
            this.$scope.selection = selection.concat(entry);
            return;
        }
        selection.splice(index, 1);
        this.$scope.selection = selection;
    }

    toggleSelectAll() {

        if (this.$scope.selection.length < this.$scope.entries.length) {
            this.$scope.selection = this.$scope.entries;
            return;
        }

        this.$scope.selection = [];
    }
}

maChartController.$inject = ['$scope', '$element', 'FieldFormatter', '$location', '$stateParams', '$anchorScroll'];
