import { __assign, __extends } from "tslib";
import React, { isValidElement, cloneElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from '../icon';
import { obj, func } from '../util';
import Base from './base';
import Group from './group';
// preventDefault here can stop onBlur to keep focus state
function preventDefault(e) {
    e.preventDefault();
}
/** Input */
var Input = /** @class */ (function (_super) {
    __extends(Input, _super);
    function Input(props) {
        var _this = _super.call(this, props) || this;
        _this.handleKeyDown = function (e) {
            if (e.keyCode === 13) {
                _this.props.onPressEnter(e);
            }
            _this.onKeyDown(e);
        };
        _this.handleKeyDownFromClear = function (e) {
            if (e.keyCode === 13) {
                _this.onClear(e);
            }
        };
        var value;
        if ('value' in props) {
            value = props.value;
        }
        else {
            value = props.defaultValue;
        }
        _this.state = {
            value: typeof value === 'undefined' ? '' : value,
        };
        return _this;
    }
    // `Enter` was considered to be two chars in chrome , but one char in ie.
    // so we make all `Enter` to be two chars
    Input.prototype.getValueLength = function (value) {
        var nv = "".concat(value);
        var strLen = this.props.getValueLength(nv);
        if (typeof strLen !== 'number') {
            strLen = nv.length;
        }
        return strLen;
    };
    Input.prototype.renderControl = function () {
        var _a;
        var _this = this;
        var _b = this.props, hasClear = _b.hasClear, readOnly = _b.readOnly, state = _b.state, prefix = _b.prefix, hint = _b.hint, extra = _b.extra, locale = _b.locale, disabled = _b.disabled, hoverShowClear = _b.hoverShowClear;
        var lenWrap = this.renderLength();
        var stateWrap = null;
        if (state === 'success') {
            stateWrap = React.createElement(Icon, { type: "success-filling", className: "".concat(prefix, "input-success-icon") });
        }
        else if (state === 'loading') {
            stateWrap = React.createElement(Icon, { type: "loading", className: "".concat(prefix, "input-loading-icon") });
        }
        else if (state === 'warning') {
            stateWrap = React.createElement(Icon, { type: "warning", className: "".concat(prefix, "input-warning-icon") });
        }
        var clearWrap = null;
        // showClear属性应该与disable属性为互斥状态
        var showClear = hasClear && !readOnly && !!"".concat(this.state.value) && !disabled;
        if (hint || showClear) {
            var hintIcon = null;
            if (hint) {
                if (typeof hint === 'string') {
                    hintIcon = React.createElement(Icon, { type: hint, className: "".concat(prefix, "input-hint") });
                }
                else if (isValidElement(hint)) {
                    hintIcon = cloneElement(hint, {
                        className: classNames(hint.props.className, "".concat(prefix, "input-hint")),
                    });
                }
                else {
                    hintIcon = hint;
                }
            }
            else {
                var cls = classNames((_a = {},
                    _a["".concat(prefix, "input-hint")] = true,
                    _a["".concat(prefix, "input-clear-icon")] = true,
                    _a["".concat(prefix, "input-hover-show")] = hoverShowClear,
                    _a));
                hintIcon = (React.createElement(Icon, { type: "delete-filling", role: "button", tabIndex: "0", className: cls, "aria-label": locale.clear, onClick: this.onClear.bind(this), onMouseDown: preventDefault, onKeyDown: this.handleKeyDownFromClear }));
            }
            clearWrap = (React.createElement("span", { className: "".concat(prefix, "input-hint-wrap") },
                hasClear && hint ? (React.createElement(Icon, { type: "delete-filling", role: "button", tabIndex: "0", className: "".concat(prefix, "input-clear ").concat(prefix, "input-clear-icon"), "aria-label": locale.clear, onClick: this.onClear.bind(this), onMouseDown: preventDefault, onKeyDown: this.handleKeyDownFromClear })) : null,
                hintIcon));
        }
        if (state === 'loading') {
            clearWrap = null;
        }
        return clearWrap || lenWrap || stateWrap || extra ? (React.createElement("span", { onClick: function () { return _this.focus(); }, className: "".concat(prefix, "input-control") },
            clearWrap,
            lenWrap,
            stateWrap,
            extra)) : null;
    };
    Input.prototype.renderLabel = function () {
        var _a = this.props, label = _a.label, prefix = _a.prefix, id = _a.id;
        return label ? (React.createElement("label", { className: "".concat(prefix, "input-label"), htmlFor: id }, label)) : null;
    };
    Input.prototype.renderInner = function (inner, cls) {
        return inner ? React.createElement("span", { className: cls }, inner) : null;
    };
    Input.prototype.onClear = function (e) {
        if (this.props.disabled) {
            return;
        }
        // 非受控模式清空内部数据
        if (!('value' in this.props)) {
            this.setState({
                value: '',
            });
        }
        this.props.onChange('', e, 'clear');
        this.focus();
    };
    Input.prototype.render = function () {
        var _a, _b, _c, _d, _e, _f, _g;
        var _h = this.props, size = _h.size, htmlType = _h.htmlType, htmlSize = _h.htmlSize, autoComplete = _h.autoComplete, autoFocus = _h.autoFocus, disabled = _h.disabled, style = _h.style, innerBefore = _h.innerBefore, innerAfter = _h.innerAfter, innerBeforeClassName = _h.innerBeforeClassName, innerAfterClassName = _h.innerAfterClassName, className = _h.className, hasBorder = _h.hasBorder, prefix = _h.prefix, isPreview = _h.isPreview, renderPreview = _h.renderPreview, addonBefore = _h.addonBefore, addonAfter = _h.addonAfter, addonTextBefore = _h.addonTextBefore, addonTextAfter = _h.addonTextAfter, inputRender = _h.inputRender, rtl = _h.rtl, composition = _h.composition;
        var hasAddon = addonBefore || addonAfter || addonTextBefore || addonTextAfter;
        var cls = classNames(this.getClass(), (_a = {},
            _a["".concat(prefix).concat(size)] = true,
            _a["".concat(prefix, "hidden")] = this.props.htmlType === 'hidden',
            _a["".concat(prefix, "noborder")] = !hasBorder || this.props.htmlType === 'file',
            _a["".concat(prefix, "input-group-auto-width")] = hasAddon,
            _a["".concat(prefix, "disabled")] = disabled,
            _a[className] = !!className && !hasAddon,
            _a));
        var innerCls = "".concat(prefix, "input-inner");
        var innerBeforeCls = classNames((_b = {},
            _b[innerCls] = true,
            _b["".concat(prefix, "before")] = true,
            _b[innerBeforeClassName] = innerBeforeClassName,
            _b));
        var innerAfterCls = classNames((_c = {},
            _c[innerCls] = true,
            _c["".concat(prefix, "after")] = true,
            _c["".concat(prefix, "input-inner-text")] = typeof innerAfter === 'string',
            _c[innerAfterClassName] = innerAfterClassName,
            _c));
        var previewCls = classNames((_d = {},
            _d["".concat(prefix, "form-preview")] = true,
            _d[className] = !!className,
            _d));
        var props = this.getProps();
        // custom data attributes are assigned to the top parent node
        // data-类自定义数据属性分配到顶层node节点
        var dataProps = obj.pickAttrsWith(this.props, 'data-');
        // Custom props are transparently transmitted to the core input node by default
        // 自定义属性默认透传到核心node节点：input
        var others = obj.pickOthers(Object.assign({}, dataProps, Input.propTypes), this.props);
        if (isPreview) {
            var value = props.value;
            var label = this.props.label;
            if (typeof renderPreview === 'function') {
                return (React.createElement("div", __assign({}, others, { className: previewCls }), renderPreview(value, this.props)));
            }
            return (React.createElement("div", __assign({}, others, { className: previewCls }),
                addonBefore || addonTextBefore,
                label,
                innerBefore,
                value,
                innerAfter,
                addonAfter || addonTextAfter));
        }
        var compositionProps = {};
        if (composition) {
            compositionProps.onCompositionStart = this.handleCompositionStart;
            compositionProps.onCompositionEnd = this.handleCompositionEnd;
        }
        var inputEl = (React.createElement("input", __assign({}, others, props, compositionProps, { height: "100%", type: htmlType, size: htmlSize, autoFocus: autoFocus, autoComplete: autoComplete, onKeyDown: this.handleKeyDown, ref: this.saveRef })));
        var inputWrap = (React.createElement("span", __assign({}, dataProps, { dir: rtl ? 'rtl' : undefined, className: cls, style: hasAddon ? undefined : style }),
            this.renderLabel(),
            this.renderInner(innerBefore, innerBeforeCls),
            inputRender(inputEl),
            this.renderInner(innerAfter, innerAfterCls),
            this.renderControl()));
        var groupCls = classNames((_e = {},
            _e["".concat(prefix, "input-group-text")] = true,
            _e["".concat(prefix).concat(size)] = !!size,
            _e["".concat(prefix, "disabled")] = disabled,
            _e));
        var addonBeforeCls = classNames((_f = {},
            _f[groupCls] = addonTextBefore,
            _f));
        var addonAfterCls = classNames((_g = {},
            _g[groupCls] = addonTextAfter,
            _g));
        if (hasAddon) {
            return (React.createElement(Group, __assign({}, dataProps, { prefix: prefix, className: className, style: style, disabled: disabled, addonBefore: addonBefore || addonTextBefore, addonBeforeClassName: addonBeforeCls, addonAfter: addonAfter || addonTextAfter, addonAfterClassName: addonAfterCls }), inputWrap));
        }
        return inputWrap;
    };
    Input.displayName = 'Input';
    Input.getDerivedStateFromProps = Base.getDerivedStateFromProps;
    Input.propTypes = __assign(__assign({}, Base.propTypes), { 
        /**
         * label
         */
        label: PropTypes.node, 
        /**
         * 是否出现clear按钮
         */
        hasClear: PropTypes.bool, 
        /**
         * 是否有边框
         */
        hasBorder: PropTypes.bool, 
        /**
         * 状态
         * @enumdesc 错误, 校验中, 成功, 警告
         */
        state: PropTypes.oneOf(['error', 'loading', 'success', 'warning']), 
        /**
         * 按下回车的回调
         */
        onPressEnter: PropTypes.func, 
        /**
         * 原生type
         */
        htmlType: PropTypes.string, htmlSize: PropTypes.string, 
        /**
         * 水印 (Icon的type类型，和hasClear占用一个地方)
         */
        hint: PropTypes.oneOfType([PropTypes.string, PropTypes.node]), 
        /**
         * 文字前附加内容
         */
        innerBefore: PropTypes.node, 
        /**
         * 文字后附加内容
         */
        innerAfter: PropTypes.node, 
        /**
         * 输入框前附加内容
         */
        addonBefore: PropTypes.node, 
        /**
         * 输入框后附加内容
         */
        addonAfter: PropTypes.node, 
        /**
         * 输入框前附加文字
         */
        addonTextBefore: PropTypes.node, 
        /**
         * 输入框后附加文字
         */
        addonTextAfter: PropTypes.node, 
        /**
         * (原生input支持)
         */
        autoComplete: PropTypes.string, 
        /**
         * 自动聚焦(原生input支持)
         */
        autoFocus: PropTypes.bool, inputRender: PropTypes.func, extra: PropTypes.node, innerBeforeClassName: PropTypes.string, innerAfterClassName: PropTypes.string, 
        /**
         * 是否为预览态
         */
        isPreview: PropTypes.bool, 
        /**
         * 预览态模式下渲染的内容
         * @param {number} value 评分值
         */
        renderPreview: PropTypes.func, 
        /**
         * hover展示clear (配合 hasClear=true使用)
         * @version 1.24
         */
        hoverShowClear: PropTypes.bool });
    Input.defaultProps = __assign(__assign({}, Base.defaultProps), { autoComplete: 'off', hasBorder: true, isPreview: false, hoverShowClear: false, onPressEnter: func.noop, inputRender: function (el) { return el; } });
    return Input;
}(Base));
export default Input;
