import * as React from 'react';
import classnames from 'classnames';
import { func } from '../util';

interface UIStateProps {
    onFocus?: React.FocusEventHandler<HTMLElement>;
    onBlur?: React.FocusEventHandler<HTMLElement>;
    // 你可以在这里添加更多的 props 类型定义
}

export interface UIStateState {
    focused?: boolean;
    // 如果有其他的 state 属性，也可以在这里定义
}

const { makeChain } = func;
// UIState 为一些特殊元素的状态响应提供了标准的方式，
// 尤其适合CSS无法完全定制的控件，比如checkbox，radio等。
// 若组件 disable 则自行判断是否需要绑定状态管理。
// 注意：disable 不会触发事件，请使用resetUIState还原状态
/* eslint-disable react/prop-types */
class UIState<
    P extends UIStateProps = UIStateProps,
    S extends UIStateState = UIStateState,
> extends React.Component<P, S> {
    state: S = {} as S;

    constructor(props: P) {
        super(props);
        this._onUIFocus = this._onUIFocus.bind(this);
        this._onUIBlur = this._onUIBlur.bind(this);
    }
    // base 事件绑定的元素
    getStateElement(base: React.ReactElement): React.ReactElement {
        const { onFocus, onBlur } = this.props;
        return React.cloneElement(base, {
            onFocus: makeChain(this._onUIFocus, onFocus),
            onBlur: makeChain(this._onUIBlur, onBlur),
        });
    }
    // 获取状态classname
    getStateClassName() {
        const { focused } = this.state;
        return classnames({
            focused,
        });
    }
    // 复原状态
    resetUIState() {
        this.setState({
            focused: false,
        });
    }
    _onUIFocus() {
        this.setState({
            focused: true,
        });
    }
    _onUIBlur() {
        this.setState({
            focused: false,
        });
    }
}

export default UIState;
