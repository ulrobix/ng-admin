import layoutTemplate from '../view/layout.html';
import dashboardTemplate from '../view/dashboard.html';
import errorTemplate from '../view/404.html';

function dataStoreProvider() {
    return ['AdminDescription', function (AdminDescription) {
        return AdminDescription.getDataStore();
    }];
}

function entryConstructorProvider() {
    return ['AdminDescription', function (AdminDescription) {
        return AdminDescription.getEntryConstructor();
    }];
}

function routing($stateProvider, $urlRouterProvider) {

    $stateProvider.state('ng-admin', {
        abstract: true,
        views: {
            'ng-admin': {
                controller: 'AppController',
                controllerAs: 'appController',
                templateProvider: ['NgAdminConfiguration', function(Configuration) {
                    return Configuration().layout() || layoutTemplate;
                }]
            }
        }
    });

    $stateProvider.state('dashboards', {
        parent: 'ng-admin',
        url: '/dashboards/:name',
        params: {
            name: null,
        },
        controller: 'DashboardController',
        controllerAs: 'dashboardController',
        resolve: {
            dataStore: dataStoreProvider(),
            Entry: entryConstructorProvider(),
            hasEntities: ['NgAdminConfiguration', function(Configuration) {
                return Configuration().entities.length > 0;
            }],
            dashboard: ['$stateParams', 'NgAdminConfiguration', function($stateParams, Configuration) {
                try {
                    return Configuration().getDashboard($stateParams.name);
                } catch (e) {
                    var error404 = new Error('Unknown dashboard name');
                    error404.status = 404; // trigger the 404 error
                    throw error404;
                }
            }],
            widgets: ['dashboard', function(dashboard) {
                return dashboard.widgets;
            }],
            responses: ['$stateParams', '$q', 'widgets', 'dataStore', 'Entry', 'ReadQueries', function($stateParams, $q, widgets, dataStore, Entry, ReadQueries) {
                var sortField = 'sortField' in $stateParams ? $stateParams.sortField : null;
                var sortDir = 'sortDir' in $stateParams ? $stateParams.sortDir : null;

                var promises = {},
                    widget,
                    widgetSortField,
                    widgetSortDir,
                    widgetName;

                for (widgetName in widgets) {
                    widget = widgets[widgetName];
                    widgetSortField = widget.getSortFieldName();
                    widgetSortDir = widget.sortDir();
                    if (sortField && sortField.split('.')[0] === widget.name()) {
                        widgetSortField = sortField;
                        widgetSortDir = sortDir;
                    }
                    promises[widgetName] = (function (widget, widgetSortField, widgetSortDir) {
                        var rawEntries;

                        return ReadQueries
                            .getAll(widget, 1, {}, widgetSortField, widgetSortDir)
                            .then(response => {
                                rawEntries = response.data;
                                return rawEntries;
                            })
                            .then(rawEntries => ReadQueries.getReferenceData(widget.fields(), rawEntries))
                            .then(referenceData => {
                                const references = widget.getReferences();
                                for (var name in referenceData) {
                                    Entry.createArrayFromRest(
                                        referenceData[name],
                                        [references[name].targetField()],
                                        references[name].targetEntity().name(),
                                        references[name].targetEntity().identifier().name()
                                    ).map(entry => dataStore.addEntry(references[name].targetEntity().uniqueId + '_values', entry));
                                }
                            })
                            .then(() => {
                                var entries = widget.mapEntries(rawEntries);

                                // shortcut to display widget of entry with included referenced values
                                dataStore.fillReferencesValuesFromCollection(entries, widget.getReferences(), true);

                                return entries;
                            });
                    })(widget, widgetSortField, widgetSortDir);
                }

                return $q.all(promises);
            }],
            entries: ['responses', 'widgets', function(responses, widgets) {
                var widgetName,
                    entries = {};

                for (widgetName in responses) {
                    entries[widgets[widgetName].name()] = responses[widgetName];
                }

                return entries;
            }]
        },
        templateProvider: ['dashboard', function(dashboard) {
            return dashboard.template() || dashboardTemplate;
        }],
    });

    $stateProvider.state('ma-404', {
        parent: 'ng-admin',
        template: errorTemplate
    });

    $urlRouterProvider.when('', 'dashboards/primary');

    $urlRouterProvider.otherwise(function($injector, $location) {
        var state = $injector.get('$state');
        state.go('ma-404');
        return $location.path();
    });
}

routing.$inject = ['$stateProvider', '$urlRouterProvider'];

export default routing;
