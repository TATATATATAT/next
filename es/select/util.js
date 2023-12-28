import { __assign, __read, __rest, __spreadArray } from "tslib";
import { Children } from 'react';
/**
 * util module
 */
/**
 * 是否是单选模式
 * @param {string} mode
 * @return {boolean} is single mode
 */
export function isSingle(mode) {
    return !mode || mode === 'single';
}
/**
 * 在 Select 中，认为 null 和 undefined 都是空值
 * @param {*} n any object
 * @return {boolean}
 */
export function isNull(n) {
    return n === null || n === undefined;
}
/**
 * 将字符串中的正则表达式关键字符添加转义
 * @param {string} str
 * @return {string}
 */
export function escapeForReg(str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
/**
 * filter by key
 * @param {string} key filter key
 * @param {object} item item object
 * @return {boolean} it's filtered
 */
export function filter(key, item) {
    var _key = escapeForReg("".concat(key));
    var regExp = new RegExp("(".concat(_key, ")"), 'ig');
    return regExp.test("".concat(item.value)) || regExp.test("".concat(item.label));
}
/**
 * loop map
 * @param {Array} dataSource
 * @param {function} callback
 * @return {Array}
 * ----
 * @callback ~loopCallback
 * @param {object} option
 */
export function loopMap(dataSource, callback) {
    var result = [];
    dataSource.forEach(function (option) {
        if (option.children) {
            var children = loopMap(option.children, callback);
            result.push(__assign(__assign({}, option), { children: children }));
        }
        else {
            // eslint-disable-next-line callback-return
            var tmp = callback(option);
            tmp && result.push(tmp);
        }
    });
    return result;
}
/**
 * Parse dataSource from MenuItem
 * @static
 * @param {Array<Element>} children
 * @param {number} [deep=0] recursion deep level
 */
export function parseDataSourceFromChildren(children, deep) {
    if (deep === void 0) { deep = 0; }
    var source = [];
    Children.forEach(children, function (child, index) {
        if (!child) {
            return;
        }
        var type = child.type, childProps = child.props;
        var item2 = { deep: deep };
        var isOption = false;
        var isOptionGroup = false;
        if ((typeof type === 'function' && type._typeMark === 'next_select_option') || type === 'option') {
            isOption = true;
        }
        if ((typeof type === 'function' && type._typeMark === 'next_select_option_group') || type === 'optgroup') {
            isOptionGroup = true;
        }
        if (!isOption && !isOptionGroup) {
            return;
        }
        if (isOption) {
            // option
            // If children is a string, it can be used as value
            var isStrChild = typeof childProps.children === 'string';
            // value > key > string children > index
            item2.value =
                'value' in childProps
                    ? childProps.value
                    : 'key' in childProps
                        ? childProps.key
                        : isStrChild
                            ? childProps.children
                            : "".concat(index);
            item2.label = childProps.label || childProps.children || "".concat(item2.value);
            if ('title' in childProps) {
                item2.title = childProps.title;
            }
            childProps.disabled === true && (item2.disabled = true);
            // You can put your extra data here, and use it in `itemRender` or `labelRender`
            Object.assign(item2, childProps['data-extra'] || {});
        }
        else if (isOptionGroup && deep < 1) {
            // option group
            item2.label = childProps.label || 'Group';
            // parse children nodes
            item2.children = parseDataSourceFromChildren(childProps.children, deep + 1);
        }
        source.push(item2);
    });
    return source;
}
/**
 * Normalize dataSource
 * @static
 * @param {Array} dataSource
 * @param {number} [deep=0] recursion deep level
 * ----
 * value priority: value > 'index'
 * label priority: label > 'value' > 'index'
 * disabled: disabled === true
 */
export function normalizeDataSource(dataSource, deep, showDataSourceChildren) {
    if (deep === void 0) { deep = 0; }
    if (showDataSourceChildren === void 0) { showDataSourceChildren = true; }
    var source = [];
    dataSource.forEach(function (item, index) {
        // enable array of basic type
        if (/string|boolean|number/.test(typeof item) || item === null || item === undefined) {
            item = { label: "".concat(item), value: item };
        }
        // filter off addon item
        if (item && item.__isAddon) {
            return;
        }
        var item2 = { deep: deep };
        // deep < 1: only 2 level allowed
        if (Array.isArray(item.children) && deep < 1 && showDataSourceChildren) {
            // handle group
            item2.label = item.label || item.value || "Group ".concat(index);
            // parse children
            item2.children = normalizeDataSource(item.children, deep + 1);
        }
        else {
            var value = item.value, label = item.label, disabled = item.disabled, title = item.title, others = __rest(item, ["value", "label", "disabled", "title"]);
            // undefined 认为是没传取 index 值替代
            item2.value = typeof value !== 'undefined' ? value : "".concat(index);
            item2.label = label || "".concat(item2.value);
            if ('title' in item) {
                item2.title = title;
            }
            disabled === true && (item2.disabled = true);
            Object.assign(item2, others);
        }
        source.push(item2);
    });
    return source;
}
/**
 * Get flatten dataSource
 * @static
 * @param  {Array} dataSource structured dataSource
 * @return {Array}
 */
export function flattingDataSource(dataSource) {
    var source = [];
    dataSource.forEach(function (item) {
        if (Array.isArray(item.children)) {
            source.push.apply(source, __spreadArray([], __read(flattingDataSource(item.children)), false));
        }
        else {
            source.push(item);
        }
    });
    return source;
}
export function filterDataSource(dataSource, key, filter, addonKey) {
    if (!Array.isArray(dataSource)) {
        return [];
    }
    if (typeof key === 'undefined' || key === null) {
        return [].concat(dataSource);
    }
    var addKey = true;
    var menuDataSource = loopMap(dataSource, function (option) {
        if (key === "".concat(option.value)) {
            addKey = false;
        }
        return filter(key, option) && !option.__isAddon && option;
    });
    // if key not in menuDataSource, add key to dataSource
    if (addonKey && key && addKey) {
        menuDataSource.unshift({
            value: key,
            label: key,
            __isAddon: true,
        });
    }
    return menuDataSource;
}
function getKeyItemByValue(value, valueMap) {
    var item;
    if (typeof value === 'object') {
        if (value.hasOwnProperty('value')) {
            item = value;
        }
        else {
            item = __assign({ value: '' }, value);
        }
    }
    else {
        item = valueMap["".concat(value)] || {
            value: value,
            label: value,
        };
    }
    return item;
}
/**
 * compute valueDataSource by new value
 * @param {Array/String} value 数据
 * @param {Object} mapValueDS   上个value的缓存数据 value => {value,label} 的映射关系表
 * @param {*} mapMenuDS  通过 dataSource 建立 value => {value,label} 的映射关系表
 * @returns {Object} value: [value]; valueDS: [{value,label}]; mapValueDS: {value: {value,label}}
 */
export function getValueDataSource(value, mapValueDS, mapMenuDS) {
    var _a;
    if (isNull(value)) {
        return {};
    }
    var newValue = [];
    var newValueDS = [];
    var newMapValueDS = {};
    var _newMapDS = Object.assign({}, mapValueDS, mapMenuDS);
    if (Array.isArray(value)) {
        value.forEach(function (v) {
            var item = getKeyItemByValue(v, _newMapDS);
            newValueDS.push(item);
            newMapValueDS["".concat(item.value)] = item;
            newValue.push(item.value);
        });
        return {
            value: newValue, // [value]
            valueDS: newValueDS, // [{value,label}]
            mapValueDS: newMapValueDS, // {value: {value,label}}
        };
    }
    else {
        var item = getKeyItemByValue(value, _newMapDS);
        return {
            value: item.value,
            valueDS: item,
            mapValueDS: (_a = {},
                _a["".concat(item.value)] = item,
                _a),
        };
    }
}
/**
 * Get flatten dataSource
 * @static
 * @param  {any} value structured dataSource
 * @return {String}
 */
export function valueToSelectKey(value) {
    var val;
    if (typeof value === 'object' && value.hasOwnProperty('value')) {
        val = value.value;
    }
    else {
        val = value;
    }
    return "".concat(val);
}
/**
 * UP Down 改进双向链表方法
 */
// function DoubleLinkList(element){
//     this.prev = null;
//     this.next = null;
//     this.element = element;
// }
//
// export function mapDoubleLinkList(dataSource){
//
//     const mapDS = {};
//     let doubleLink = null;
//
//     let head = null;
//     let tail = null;
//
//     function  append(element) {
//         if (!doubleLink) {
//             doubleLink = new DoubleLinkList(element);
//             head = doubleLink;
//             tail = doubleLink;
//             return doubleLink;
//         }
//
//         const node = new DoubleLinkList(element);
//         tail.next = node;
//         node.prev = tail;
//         tail = node;
//
//         return tail;
//     }
//
//     dataSource.forEach((item => {
//         if (item.disabled) {
//             return;
//         }
//         mapDS[`${item.value}`] = append(item);
//     }));
//
//     return mapDS;
// }
//
