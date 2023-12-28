import { __assign, __extends, __rest } from "tslib";
import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
/**
 * Grid.Row
 * @order 1
 */
var Row = /** @class */ (function (_super) {
    __extends(Row, _super);
    function Row() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Row.prototype.render = function () {
        var _a, _b, _c, _d;
        /* eslint-disable no-unused-vars */
        var _e = this.props, prefix = _e.prefix, pure = _e.pure, wrap = _e.wrap, fixed = _e.fixed, gutter = _e.gutter, fixedWidth = _e.fixedWidth, align = _e.align, justify = _e.justify, hidden = _e.hidden, className = _e.className, Tag = _e.component, children = _e.children, rtl = _e.rtl, others = __rest(_e, ["prefix", "pure", "wrap", "fixed", "gutter", "fixedWidth", "align", "justify", "hidden", "className", "component", "children", "rtl"]);
        /* eslint-enable no-unused-vars */
        var hiddenClassObj;
        if (hidden === true) {
            hiddenClassObj = (_a = {}, _a["".concat(prefix, "row-hidden")] = true, _a);
        }
        else if (typeof hidden === 'string') {
            hiddenClassObj = (_b = {}, _b["".concat(prefix, "row-").concat(hidden, "-hidden")] = !!hidden, _b);
        }
        else if (Array.isArray(hidden)) {
            hiddenClassObj = hidden.reduce(function (ret, point) {
                ret["".concat(prefix, "row-").concat(point, "-hidden")] = !!point;
                return ret;
            }, {});
        }
        var newClassName = cx(__assign(__assign((_c = {}, _c["".concat(prefix, "row")] = true, _c["".concat(prefix, "row-wrap")] = wrap, _c["".concat(prefix, "row-fixed")] = fixed, _c["".concat(prefix, "row-fixed-").concat(fixedWidth)] = !!fixedWidth, _c["".concat(prefix, "row-justify-").concat(justify)] = !!justify, _c["".concat(prefix, "row-align-").concat(align)] = !!align, _c), hiddenClassObj), (_d = {}, _d[className] = !!className, _d)));
        var newChildren = children;
        var gutterNumber = parseInt(gutter, 10);
        if (gutterNumber !== 0) {
            var halfGutterString_1 = "".concat(gutterNumber / 2, "px");
            others.style = __assign({ marginLeft: "-".concat(halfGutterString_1), marginRight: "-".concat(halfGutterString_1) }, (others.style || {}));
            newChildren = Children.map(children, function (child) {
                if (child && child.type && typeof child.type === 'function' && child.type.isNextCol) {
                    var newChild = cloneElement(child, {
                        style: __assign({ paddingLeft: halfGutterString_1, paddingRight: halfGutterString_1 }, (child.style || {})),
                    });
                    return newChild;
                }
                return child;
            });
        }
        return (React.createElement(Tag, __assign({ dir: rtl ? 'rtl' : 'ltr', role: "row", className: newClassName }, others), newChildren));
    };
    Row.propTypes = {
        prefix: PropTypes.string,
        pure: PropTypes.bool,
        rtl: PropTypes.bool,
        className: PropTypes.string,
        style: PropTypes.object,
        /**
         * 行内容
         */
        children: PropTypes.node,
        /**
         * 列间隔
         */
        gutter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        /**
         * 列在行中宽度溢出后是否换行
         */
        wrap: PropTypes.bool,
        /**
         * 行在某一断点下宽度是否保持不变（默认行宽度随视口变化而变化）
         */
        fixed: PropTypes.bool,
        /**
         * 固定行的宽度为某一断点的宽度，不受视口影响而变动
         * @enumdesc 320px, 480px, 720px, 990px, 1200px, 1500px
         */
        fixedWidth: PropTypes.oneOf(['xxs', 'xs', 's', 'm', 'l', 'xl']),
        /**
         * （不支持IE9浏览器）多列垂直方向对齐方式
         * @enumdesc 顶部对齐, 居中对齐, 底部对齐, 按第一行文字基线对齐, 未设置高度或设为 auto，将占满整个容器的高度
         */
        align: PropTypes.oneOf(['top', 'center', 'bottom', 'baseline', 'stretch']),
        /**
         * （不支持IE9浏览器）行内具有多余空间时的布局方式
         * @enumdesc 左对齐, 居中对齐, 右对齐, 两端对齐，列之间间距相等, 每列具有相同的左右间距，行两端间距是列间距的二分之一
         */
        justify: PropTypes.oneOf(['start', 'center', 'end', 'space-between', 'space-around']),
        /**
         * 行在不同断点下的显示与隐藏<br><br>**可选值**:<br>true(在所有断点下隐藏)<br>false(在所有断点下显示)<br>'xs'(在 xs 断点下隐藏）<br>['xxs', 'xs', 's', 'm', 'l', 'xl'](在 xxs, xs, s, m, l, xl 断点下隐藏）
         */
        hidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.array]),
        /**
         * 指定以何种元素渲染该节点
         * - 默认为 'div'
         */
        component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    };
    Row.defaultProps = {
        prefix: 'next-',
        pure: false,
        fixed: false,
        gutter: 0,
        wrap: false,
        component: 'div',
    };
    return Row;
}(Component));
export default Row;
