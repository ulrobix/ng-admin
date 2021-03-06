export default class NgAdminConfiguration {
    constructor($compileProvider) {
        this.config = null;
        this.adminDescription = null;
        this.$compileProvider = $compileProvider;
    }

    setAdminDescription(adminDescription) {
        this.adminDescription = adminDescription;
    }

    configure(config) {
        this.config = config;

        this.$compileProvider.debugInfoEnabled(this.config.debug());
    }

    $get() {
        var config = this.config;
        return function () {
            return config;
        };
    }

    application(name, debug) {
        return this.adminDescription.application(name, debug);
    }

    entity(name) {
        return this.adminDescription.entity(name);
    }

    field(name, type) {
        return this.adminDescription.field(name, type);
    }

    registerFieldType(name, type) {
        return this.adminDescription.registerFieldType(name, type);
    }

    getFieldConstructor(name) {
      return this.adminDescription.getFieldConstructor(name);
    }

    menu(entity) {
        return this.adminDescription.menu(entity);
    }

    collection(entity) {
        return this.adminDescription.collection(entity);
    }

    chart(type, entity) {
        return this.adminDescription.chart(type, entity);
    }

    dashboard(name) {
        return this.adminDescription.dashboard(name);
    }
}

NgAdminConfiguration.$inject = ['$compileProvider'];
