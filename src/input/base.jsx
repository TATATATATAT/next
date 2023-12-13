import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import Icon from '../icon';
import ConfigProvider from '../config-provider';
import { func } from '../util';
import zhCN from '../locale/zh-cn';
// preventDefault here can stop onBlur to keep focus state
function preventDefault(e) {
    e.preventDefault();
}
class Base extends React.Component {
    static propTypes = {
        ...ConfigProvider.propTypes,
        /**
         * 当前值
         */
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        /**
         * 初始化值
         */
        defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        /**
         * 发生改变的时候触发的回调
         * @param {String} value 数据
         * @param {Event} e DOM事件对象
         */
        onChange: PropTypes.func,
        /**
         * 键盘按下的时候触发的回调
         * @param {Event} e DOM事件对象
         * @param {Object} opts 可扩展的附加信息：<br> - opts.overMaxLength: {Boolean} 已超出最大长度<br> - opts.beTrimed: {Boolean} 输入的空格被清理
         */
        onKeyDown: PropTypes.func,
        /**
         * 禁用状态
         */
        disabled: PropTypes.bool,
        /**
         * 最大长度
         */
        maxLength: PropTypes.number,
        /**
         * 是否展现最大长度样式（旧版本为 hasLimitHint，目前仍兼容旧用法，将在2.x直接废弃）
         */
        showLimitHint: PropTypes.bool,
        /**
         * 当设置了maxLength时，是否截断超出字符串
         */
        cutString: PropTypes.bool,
        /**
         * 只读
         */
        readOnly: PropTypes.bool,
        /**
         * onChange返回会自动去除头尾空字符
         */
        trim: PropTypes.bool,
        /**
         * 输入提示
         */
        placeholder: PropTypes.string,
        /**
         * 获取焦点时候触发的回调
         * @param {Event} e DOM事件对象
         */
        onFocus: PropTypes.func,
        /**
         * 失去焦点时候触发的回调
         * @param {Event} e DOM事件对象
         */
        onBlur: PropTypes.func,
        /**
         * 自定义字符串计算长度方式
         * @param {String} value 数据
         * @returns {Number} 自定义长度
         */
        getValueLength: PropTypes.func,
        inputStyle: PropTypes.object,
        /**
         * 自定义class
         */
        className: PropTypes.string,
        /**
         * 自定义内联样式
         */
        style: PropTypes.object,
        /**
         * 原生type
         */
        htmlType: PropTypes.string,
        /**
         * name
         */
        name: PropTypes.string,
        rtl: PropTypes.bool,
        state: PropTypes.oneOf(['error', 'loading', 'success', 'warning']),
        locale: PropTypes.object,
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
         * 尺寸
         * @enumdesc 小, 中, 大
         */
        size: PropTypes.oneOf(['small', 'medium', 'large']),
        /**
         * 开启后会过滤输入法中间字母状态，文字输入完成后才会触发 onChange
         * @version 1.23
         */
        composition: PropTypes.bool,
        onCompositionStart: PropTypes.func,
        onCompositionEnd: PropTypes.func,
    };

    static defaultProps = {
        disabled: false,
        prefix: 'next-',
        size: 'medium',
        maxLength: null,
        showLimitHint: false,
        cutString: true,
        readOnly: false,
        isPreview: false,
        trim: false,
        composition: false,
        onFocus: func.noop,
        onBlur: func.noop,
        onChange: func.noop,
        onKeyDown: func.noop,
        getValueLength: func.noop,
        onCompositionStart: func.noop,
        onCompositionEnd: func.noop,
        locale: zhCN.Input,
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if ('value' in nextProps && nextProps.value !== prevState.value && !prevState.composition) {
            const value = nextProps.value;
            return {
                value: value === undefined || value === null ? '' : value,
            };
        }

        return null;
    }

    ieHack(value) {
        return value;
    }

    handleCompositionStart = e => {
        this.setState({
            composition: true,
        });
        this.props.onCompositionStart(e);
    };

    handleCompositionEnd = e => {
        this.setState({
            composition: false,
        });
        this.props.onCompositionEnd(e);

        const value = e.target.value;
        this.props.onChange(value, e);
    };

    onChange(e) {
        if ('stopPropagation' in e) {
            e.stopPropagation();
        } else if ('cancelBubble' in e) {
            e.cancelBubble();
        }

        let value = e.target.value;

        if (this.props.trim) {
            value = value.trim();
        }

        value = this.ieHack(value);

        // not controlled
        if (!('value' in this.props) || this.state.composition) {
            this.setState({
                value,
            });
        }

        if (this.state.composition) {
            return;
        }

        // Number('') = 0
        if (value && this.props.htmlType === 'number') {
            value = Number(value);
        }

        this.props.onChange(value, e);
    }

    onKeyDown(e) {
        const value = e.target.value;
        const { maxLength } = this.props;
        const len = maxLength > 0 && value ? this.getValueLength(value) : 0;
        const opts = {};

        // has enable trim and has input whitespace
        if (this.props.trim && e.keyCode === 32) {
            opts.beTrimed = true;
        }

        // has defined maxLength and has over max length and has not input backspace and delete
        if (
            maxLength > 0 &&
            (len > maxLength + 1 ||
                ((len === maxLength || len === maxLength + 1) && e.keyCode !== 8 && e.keyCode !== 46))
        ) {
            opts.overMaxLength = true;
        }

        this.props.onKeyDown(e, opts);
    }

    onFocus(e) {
        this.setState({
            focus: true,
        });
        this.props.onFocus(e);
    }

    onBlur(e) {
        this.setState({
            focus: false,
        });
        this.props.onBlur(e);
    }
    icon() {
        const { hasClear, readOnly, state, prefix, locale, disabled } = this.props;
        let clearWrap = null;
        // showClear属性应该与disable属性为互斥状态
        const showClear = hasClear && !readOnly && !!`${this.state.value}` && !disabled;
        clearWrap = showClear ? (
            <Icon
                type="delete-filling"
                role="button"
                tabIndex="0"
                className={`${prefix}input-clear ${prefix}input-clear-icon`}
                aria-label={locale.clear}
                onClick={this.onClear.bind(this)}
                onMouseDown={preventDefault}
                onKeyDown={this.handleKeyDownFromClear}
            />
        ) : null;
        if (state === 'loading') {
            clearWrap = null;
        }
        return clearWrap;
    }
    renderLength() {
        const { maxLength, showLimitHint, prefix, rtl } = this.props;
        const len = maxLength > 0 && this.state.value ? this.getValueLength(this.state.value) : 0;

        const classesLenWrap = classNames({
            [`${prefix}input-len`]: true,
            [`${prefix}error`]: len > maxLength,
        });

        const content = rtl ? `${maxLength}/${len}` : `${len}/${maxLength}`;

        return (
            <span className={classesLenWrap}>
                {maxLength && showLimitHint ? (
                    <span>
                        {content}
                        {this.icon() ? <span className={`${prefix}input-clear-line`}>|</span> : null}
                    </span>
                ) : null}
                {this.icon()}
            </span>
        );
    }

    renderControl() {
        const lenWrap = this.renderLength();

        return lenWrap ? (
            <span onClick={() => this.focus()} className={`${this.props.prefix}input-control`}>
                {lenWrap}
            </span>
        ) : null;
    }

    getClass() {
        const { disabled, state, prefix } = this.props;

        return classNames({
            [`${prefix}input`]: true,
            [`${prefix}disabled`]: !!disabled,
            [`${prefix}error`]: state === 'error',
            [`${prefix}warning`]: state === 'warning',
            [`${prefix}focus`]: this.state.focus,
        });
    }

    getProps() {
        const {
            placeholder,
            inputStyle,
            disabled,
            readOnly,
            cutString,
            maxLength,
            name,
            onCompositionStart,
            onCompositionEnd,
        } = this.props;
        const props = {
            style: inputStyle,
            placeholder,
            disabled,
            readOnly,
            name,
            maxLength: cutString ? maxLength : undefined,
            value: this.state.value,
            onChange: this.onChange.bind(this),
            onBlur: this.onBlur.bind(this),
            onFocus: this.onFocus.bind(this),
            onCompositionStart,
            onCompositionEnd,
        };

        // fix accessibility：auto process status of aria disabled
        if (disabled) {
            props['aria-disabled'] = disabled;
        }

        return props;
    }

    saveRef = input => {
        this.inputRef = input;
    };

    getInputNode() {
        return this.inputRef;
    }

    focus(start, end, preventScroll = false) {
        this.inputRef.focus({ preventScroll });
        if (typeof start === 'number') {
            this.inputRef.selectionStart = start;
        }
        if (typeof end === 'number') {
            this.inputRef.selectionEnd = end;
        }
    }
}

export default polyfill(Base);
