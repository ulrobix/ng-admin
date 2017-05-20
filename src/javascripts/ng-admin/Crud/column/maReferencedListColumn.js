function isSortFieldForMe(sortField, field) {
    if (!sortField) return false;
    return sortField.split('.')[0] == (field.targetEntity().name() + '_ListView');
}

export default function maReferencedListColumn(NgAdminConfiguration, $stateParams) {
    return {
        scope: {
            'field': '&',
            'entry': '&',
            'entity': '&',
            'datastore': '&'
        },
        restrict: 'E',
        link: {
            pre: function(scope) {
                scope.field = scope.field();
                scope.entry = scope.entry();
                scope.entity = scope.entity();
                var targetEntity = scope.field.targetEntity();
                scope.targetEntries = scope.datastore().getEntries(targetEntity.uniqueId + '_list');
                scope.targetEntity = NgAdminConfiguration().getEntity(targetEntity.name());
                scope.shouldDisplayDatagridActions = scope.field.actions() && scope.field.actions().length > 0;
                scope.sortField = isSortFieldForMe($stateParams.sortField, scope.field) ?
                    $stateParams.sortField :
                    scope.field.getSortFieldName();
                scope.sortDir = $stateParams.sortDir || scope.field.sortDir();
            }
        },
        template: `
<div ng-if="shouldDisplayDatagridActions" class="ng-admin-grid-actions clearfix">
    <ma-referenced-list-column-actions field="::field" entry="::entry" target-entries="::targetEntries" entity="::entity" buttons="field.actions()" class="pull-right"></ma-referenced-list-column-actionslist-actions>
</div>
<ma-datagrid ng-if="::targetEntries.length > 0" name="{{ field.datagridName() }}"
    entries="::targetEntries"
    fields="::field.targetFields()"
    list-actions="::field.listActions()"
    entity="::targetEntity"
    sort-field="::sortField"
    sort-dir="::sortDir"
    datastore="::datastore()"
    entry-css-classes="::field.entryCssClasses()">
</ma-datagrid>`
    };
}

maReferencedListColumn.$inject = ['NgAdminConfiguration', '$stateParams'];
