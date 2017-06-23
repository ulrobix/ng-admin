export default function FieldComparatorFactory(AdminDescription) {
    return AdminDescription.getFieldComparatorFactory();
}

FieldComparatorFactory.$inject = ['AdminDescription'];
