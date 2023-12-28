import { __assign, __extends, __read, __spreadArray } from "tslib";
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import ConfigProvider from '../config-provider';
import { func, obj } from '../util';
import Panel from './panel';
/** Collapse */
var Collapse = /** @class */ (function (_super) {
    __extends(Collapse, _super);
    function Collapse(props) {
        var _this = _super.call(this, props) || this;
        var expandedKeys;
        if ('expandedKeys' in props) {
            expandedKeys = props.expandedKeys;
        }
        else {
            expandedKeys = props.defaultExpandedKeys;
        }
        _this.state = {
            expandedKeys: typeof expandedKeys === 'undefined' ? [] : expandedKeys,
        };
        return _this;
    }
    Collapse.getDerivedStateFromProps = function (props) {
        if ('expandedKeys' in props) {
            return {
                expandedKeys: typeof props.expandedKeys === 'undefined' ? [] : props.expandedKeys,
            };
        }
        return null;
    };
    Collapse.prototype.onItemClick = function (key) {
        var expandedKeys = this.state.expandedKeys;
        if (this.props.accordion) {
            expandedKeys = String(expandedKeys[0]) === String(key) ? [] : [key];
        }
        else {
            expandedKeys = __spreadArray([], __read(expandedKeys), false);
            var stringKey_1 = String(key);
            var index = expandedKeys.findIndex(function (k) { return String(k) === stringKey_1; });
            var isExpanded = index > -1;
            if (isExpanded) {
                expandedKeys.splice(index, 1);
            }
            else {
                expandedKeys.push(key);
            }
        }
        this.setExpandedKey(expandedKeys);
    };
    Collapse.prototype.genratePanelId = function (itemId, index) {
        var collapseId = this.props.id;
        var id;
        if (itemId) {
            // 优先用 item自带的id
            id = itemId;
        }
        else if (collapseId) {
            // 其次用 collapseId 和 index 生成id
            id = "".concat(collapseId, "-panel-").concat(index);
        }
        return id;
    };
    Collapse.prototype.getProps = function (item, index, key) {
        var _this = this;
        var expandedKeys = this.state.expandedKeys;
        var title = item.title;
        var disabled = this.props.disabled;
        if (!disabled) {
            disabled = item.disabled;
        }
        var isExpanded = false;
        if (this.props.accordion) {
            isExpanded = String(expandedKeys[0]) === String(key);
        }
        else {
            isExpanded = expandedKeys.some(function (expandedKey) {
                if (expandedKey === null || expandedKey === undefined || key === null || key === undefined) {
                    return false;
                }
                if (expandedKey === key || expandedKey.toString() === key.toString()) {
                    return true;
                }
                return false;
            });
        }
        var id = this.genratePanelId(item.id, index);
        return {
            key: key,
            title: title,
            isExpanded: isExpanded,
            disabled: disabled,
            id: id,
            onClick: disabled
                ? null
                : function () {
                    _this.onItemClick(key);
                    if ('onClick' in item) {
                        item.onClick(key);
                    }
                },
        };
    };
    Collapse.prototype.getItemsByDataSource = function () {
        var _this = this;
        var props = this.props;
        var dataSource = props.dataSource;
        // 是否有dataSource.item传入过key
        var hasKeys = dataSource.some(function (item) { return 'key' in item; });
        return dataSource.map(function (item, index) {
            // 传入过key就用item.key 没传入则统一使用index为key
            var key = hasKeys ? item.key : "".concat(index);
            return (React.createElement(Panel, __assign({}, _this.getProps(item, index, key), { key: key }), item.content));
        });
    };
    Collapse.prototype.getItemsByChildren = function () {
        var _this = this;
        // 是否有child传入过key
        var allKeys = React.Children.map(this.props.children, function (child) { return child && child.key; });
        var hasKeys = Boolean(allKeys && allKeys.length);
        return React.Children.map(this.props.children, function (child, index) {
            if (child && typeof child.type === 'function' && child.type.isNextPanel) {
                // 传入过key就用child.key 没传入则统一使用index为key
                var key = hasKeys ? child.key : "".concat(index);
                return React.cloneElement(child, _this.getProps(child.props, index, key));
            }
            else {
                return child;
            }
        });
    };
    Collapse.prototype.setExpandedKey = function (expandedKeys) {
        if (!('expandedKeys' in this.props)) {
            this.setState({ expandedKeys: expandedKeys });
        }
        this.props.onExpand(this.props.accordion ? expandedKeys[0] : expandedKeys);
    };
    Collapse.prototype.render = function () {
        var _a;
        var _b = this.props, prefix = _b.prefix, className = _b.className, style = _b.style, disabled = _b.disabled, dataSource = _b.dataSource, id = _b.id, rtl = _b.rtl;
        var collapseClassName = classNames((_a = {},
            _a["".concat(prefix, "collapse")] = true,
            _a["".concat(prefix, "collapse-disabled")] = disabled,
            _a[className] = Boolean(className),
            _a));
        var others = obj.pickOthers(Collapse.propTypes, this.props);
        return (React.createElement("div", __assign({ id: id, className: collapseClassName, style: style }, others, { role: "presentation", dir: rtl ? 'rtl' : undefined }), dataSource ? this.getItemsByDataSource() : this.getItemsByChildren()));
    };
    Collapse.propTypes = {
        /**
         * 样式前缀
         */
        prefix: PropTypes.string,
        /**
         * 组件接受行内样式
         */
        style: PropTypes.object,
        /**
         * 使用数据模型构建
         */
        dataSource: PropTypes.array,
        /**
         * 默认展开keys
         */
        defaultExpandedKeys: PropTypes.array,
        /**
         * 受控展开keys
         */
        expandedKeys: PropTypes.array,
        /**
         * 展开状态发升变化时候的回调
         */
        onExpand: PropTypes.func,
        /**
         * 所有禁用
         */
        disabled: PropTypes.bool,
        /**
         * 扩展class
         */
        className: PropTypes.string,
        /**
         * 手风琴模式，一次只能打开一个
         */
        accordion: PropTypes.bool,
        children: PropTypes.node,
        id: PropTypes.string,
        rtl: PropTypes.bool,
    };
    Collapse.defaultProps = {
        accordion: false,
        prefix: 'next-',
        onExpand: func.noop,
    };
    Collapse.contextTypes = {
        prefix: PropTypes.string,
    };
    return Collapse;
}(React.Component));
export default polyfill(ConfigProvider.config(Collapse));
