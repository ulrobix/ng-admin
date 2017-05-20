export default class DeleteController {
    constructor($scope, $window, $state, $injector, $q, $translate, previousState, WriteQueries, NgAdminConfiguration, progression, notification, params, view, entry) { 'ngInject';
        this.$scope = $scope;
        this.$window = $window;
        this.$state = $state;
        this.$translate = $translate;
        this.$injector = $injector;
        this.previousState = previousState;
        this.WriteQueries = WriteQueries;
        this.config = NgAdminConfiguration();
        this.entityLabel = params.entity;
        this.entityId = params.id;
        this.view = view;
        this.title = view.title();
        this.description = view.description();
        this.actions = view.actions();
        this.entity = view.getEntity();
        this.progression = progression;
        this.notification = notification;
        this.$scope.entry = entry;
        this.$scope.view = view;

        $scope.$on('$destroy', this.destroy.bind(this));

        this.previousStateParametersDeferred = $q.defer();
        $scope.$on('$stateChangeSuccess', (event, to, toParams, from, fromParams) => {
            this.previousStateParametersDeferred.resolve(fromParams);
        });
    }

    deleteOne($event) {
        const entityName = this.entity.name();
        const { entity, view, $state, progression, notification, $translate } = this;
        progression.start();
        return this.WriteQueries.deleteOne(view, this.entityId)
            .then(() => {
                if (view.onSubmitSuccess()) {
                    return this.$injector.invoke(
                        view.onSubmitSuccess(),
                        view,
                        { $event, entity: entity, entityId: this.entityId, entry: this.$scope.entry, controller: this, progression, notification });
                } else {
                    return true;
                }
            })
            .then((onSubmitSuccessResult) => {
                return onSubmitSuccessResult ? this.previousStateParametersDeferred.promise : false;
            })
            .then(previousStateParameters => {
                if (previousStateParameters) {
                    // if previous page was related to deleted entity, redirect to list
                    if (previousStateParameters.entity === entityName && previousStateParameters.id === this.entityId) {
                        return $state.go($state.get('list'), angular.extend({
                            entity: entityName
                        }, this.$state.params));
                    }
                    this.back();
                }
            })
            // no need to call progression.done() in case of success, as it's called by the view dislayed afterwards
            .then(() => $translate('DELETE_SUCCESS'))
            .then(text => notification.log(text, { addnCls: 'humane-flatty-success' }))
            .catch(error => {
                const errorMessage = this.config.getErrorMessageFor(this.view, error) || 'ERROR_MESSAGE';
                progression.done();
                $translate(errorMessage, {
                    status: error && error.status,
                    details: error && error.data && typeof error.data === 'object' ? JSON.stringify(error.data) : {}
                })
                    .catch(angular.identity) // See https://github.com/angular-translate/angular-translate/issues/1516
                    .then(text => notification.log(text, { addnCls: 'humane-flatty-error' }));
            });
    }

    back() {
        this.$window.history.back();
    }

    destroy() {
        this.$scope = undefined;
        this.$window = undefined;
        this.$state = undefined;
        this.$translate = undefined;
        this.WriteQueries = undefined;
        this.view = undefined;
        this.entity = undefined;
        this.progression = undefined;
        this.notification = undefined;
    }
}
