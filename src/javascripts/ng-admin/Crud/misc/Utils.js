
function binarySearch(array, value, comparator) {
    var mid, cmp;

    var low = 0;
    var high = array.length - 1;

    while(low <= high) {
        mid = low + (high - low >> 1);
        cmp = comparator(array[mid], value);

        if(cmp < 0.0)
            low  = mid + 1;
        else if(cmp > 0.0)
            high = mid - 1;
        else
            return mid;
    }

    return ~low;
}

function addToSet(array, value, comparator) {
    let index = binarySearch(array, value, comparator);
    if (index >= 0) {
        return index;
    } else {
        index = ~index;
        array.splice(index, 0, value);
        return index;
    }
}

function directedComparator(comparator, reverse) {
    return function(value1, value2) {
        let direction = reverse ? -1 : 1;
        return comparator(value1, value2) * direction;
    }
}

export default {
    binarySearch: binarySearch,
    addToSet: addToSet,
    directedComparator: directedComparator,
}
