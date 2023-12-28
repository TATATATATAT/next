import { __assign, __extends, __rest } from "tslib";
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import { func, obj } from '../util';
import Icon from '../icon';
import Base from './base';
import Uploader from './runtime/index';
import html5Uploader from './runtime/html5-uploader';
import List from './list';
import { fileToObject, getFileItem, errorCode } from './util';
var noop = func.noop;
/**
 * Upload
 */
var Upload = /** @class */ (function (_super) {
    __extends(Upload, _super);
    function Upload(props) {
        var _this = _super.call(this, props) || this;
        _this.onSelect = function (files) {
            var _a = _this.props, autoUpload = _a.autoUpload, afterSelect = _a.afterSelect, onSelect = _a.onSelect, limit = _a.limit;
            // 总数
            var total = _this.state.value.length + files.length;
            // 差额
            var less = limit - _this.state.value.length;
            if (less <= 0) {
                // 差额不足 则不上传
                return;
            }
            var fileList = files.map(function (file) {
                var objFile = fileToObject(file);
                objFile.state = 'selected';
                return objFile;
            });
            // 默认全量上传
            var uploadFiles = fileList;
            var discardFiles = [];
            if (total > limit) {
                // 全量上传总数会超过limit 但是 还有差额
                uploadFiles = fileList.slice(0, less);
                discardFiles = fileList.slice(less);
            }
            var value = _this.state.value.concat(fileList);
            /* eslint-disable-next */
            _this.state.value = value;
            if (autoUpload) {
                _this.uploadFiles(uploadFiles);
            }
            onSelect(uploadFiles, value);
            discardFiles.forEach(function (file) {
                // 丢弃的文件
                var err = new Error(errorCode.EXCEED_LIMIT);
                err.code = errorCode.EXCEED_LIMIT;
                _this.onError(err, null, file);
            });
            if (!autoUpload) {
                uploadFiles.forEach(function (file) {
                    var isPassed = afterSelect(file);
                    func.promiseCall(isPassed, func.noop, function (error) {
                        _this.onError(error, null, file); // TODO: handle error message
                    });
                });
                _this.onChange(value, uploadFiles);
            }
        };
        _this.onDrop = function (files) {
            _this.onSelect(files);
            _this.props.onDrop(files);
        };
        // 替换掉队列里面的文件
        _this.replaceWithNewFile = function (old, current) {
            var newFile = fileToObject(current);
            newFile.state = 'selected';
            var matchKey = old.uid !== undefined ? 'uid' : 'name';
            var fileList = _this.state.value;
            for (var i = 0; i < fileList.length; i++) {
                var item = fileList[i];
                if (item[matchKey] === old[matchKey]) {
                    fileList.splice(i, 1, newFile);
                    break;
                }
            }
            _this.uploadFiles([newFile]);
            return newFile;
        };
        _this.onProgress = function (e, file) {
            _this.state.uploading = true;
            var value = _this.state.value;
            var targetItem = getFileItem(file, value);
            if (!targetItem) {
                return;
            }
            Object.assign(targetItem, {
                state: 'uploading',
                percent: e.percent,
            });
            _this.setState({
                value: value,
            });
            _this.props.onProgress(value, targetItem);
        };
        _this.onSuccess = function (response, file) {
            var formatter = _this.props.formatter;
            if (formatter) {
                response = formatter(response, file);
            }
            try {
                if (typeof response === 'string') {
                    response = JSON.parse(response);
                }
            }
            catch (e) {
                e.code = errorCode.RESPONSE_FAIL;
                return _this.onError(e, response, file);
            }
            if (response.success === false) {
                var err = new Error(response.message || errorCode.RESPONSE_FAIL);
                err.code = errorCode.RESPONSE_FAIL;
                return _this.onError(err, response, file);
            }
            var value = _this.state.value;
            var targetItem = getFileItem(file, value);
            if (!targetItem) {
                return;
            }
            Object.assign(targetItem, {
                state: 'done',
                response: response,
                url: response.url,
                downloadURL: response.downloadURL || response.url, // 下载地址(可选)
            });
            if (!_this.props.useDataURL) {
                targetItem.imgURL = response.imgURL || response.url; // 缩略图地址(可选)
            }
            _this.updateUploadingState();
            _this.onChange(value, targetItem);
            _this.props.onSuccess(targetItem, value);
        };
        _this.onError = function (err, response, file) {
            var value = _this.state.value;
            var targetItem = getFileItem(file, value);
            if (!targetItem) {
                return;
            }
            Object.assign(targetItem, {
                state: 'error',
                error: err,
                response: response,
            });
            _this.updateUploadingState();
            _this.onChange(value, targetItem);
            _this.props.onError(targetItem, value);
        };
        /**
         * 删除文件
         * @param {File} file
         * @return {void}
         */
        _this.removeFile = function (file) {
            file.state = 'removed';
            _this.uploaderRef.abort(file); // 删除组件时调用组件的 `abort` 方法中断上传
            var fileList = _this.state.value;
            var targetItem = getFileItem(file, fileList);
            var index = fileList.indexOf(targetItem);
            if (index !== -1) {
                fileList.splice(index, 1);
                _this.onChange(fileList, targetItem);
            }
        };
        _this.updateUploadingState = function () {
            var inProgress = _this.state.value.some(function (i) { return i.state === 'uploading'; });
            if (!inProgress) {
                _this.state.uploading = false;
            }
        };
        /**
         * 取消上传
         * @param {File} file
         * @return {void}
         */
        _this.abort = function (file) {
            var fileList = _this.state.value;
            var targetItem = getFileItem(file, fileList);
            var index = fileList.indexOf(targetItem);
            if (index !== -1) {
                fileList.splice(index, 1);
                _this.onChange(fileList, targetItem);
            }
            _this.uploaderRef.abort(file); // 取消上传时调用组件的 `abort` 方法中断上传
        };
        _this.onChange = function (value, file) {
            _this.setState({
                value: value,
            });
            _this.props.onChange(value, file);
        };
        var value;
        if ('value' in props) {
            value = props.value;
        }
        else {
            value = props.defaultValue;
        }
        _this.state = {
            value: !Array.isArray(value) ? [] : value,
            uploading: false,
        };
        return _this;
    }
    Upload.getDerivedStateFromProps = function (nextProps, prevState) {
        // 上传中不允许做受控修改
        if ('value' in nextProps && nextProps.value !== prevState.value && !prevState.uploading) {
            return {
                value: !Array.isArray(nextProps.value) ? [] : nextProps.value,
            };
        }
        return null;
    };
    /**
     * 对外暴露API, 添加文件
     * @param files
     */
    Upload.prototype.selectFiles = function (files) {
        var filesArr = files.length ? Array.prototype.slice.call(files) : [files];
        this.onSelect(filesArr);
    };
    Upload.prototype.uploadFiles = function (files) {
        // NOTE: drag上传，当鼠标松开的时候回执行 onDrop，但此时onChange还没出发所以 value=[], 必须提前标识上传中
        this.state.uploading = true;
        var fileList = files
            .filter(function (file) {
            if (file.state === 'selected') {
                file.state = 'uploading';
                return true;
            }
            return false;
        })
            .map(function (file) {
            return file.originFileObj;
        });
        fileList.length && this.uploaderRef.startUpload(fileList);
    };
    /**
     * 对外暴露api，控制文件上传
     */
    Upload.prototype.startUpload = function () {
        this.uploadFiles(this.state.value);
    };
    Upload.prototype.replaceFiles = function (old, current) {
        var targetItem = getFileItem(old, this.state.value);
        if (!targetItem) {
            return;
        }
        current.uid = old.uid;
        targetItem.originFileObj = current;
    };
    Upload.prototype.isUploading = function () {
        return this.state.uploading;
    };
    Upload.prototype.render = function () {
        var _a, _b, _c, _d;
        var _e = this.props, listType = _e.listType, prefix = _e.prefix, dragable = _e.dragable, shape = _e.shape, className = _e.className, style = _e.style, useDataURL = _e.useDataURL, disabled = _e.disabled, limit = _e.limit, closable = _e.closable, beforeUpload = _e.beforeUpload, readonly = _e.readonly, onRemove = _e.onRemove, onCancel = _e.onCancel, onPreview = _e.onPreview, list = _e.list, extraRender = _e.extraRender, progressProps = _e.progressProps, rtl = _e.rtl, isPreview = _e.isPreview, renderPreview = _e.renderPreview, name = _e.name, _f = _e.fileKeyName, fileKeyName = _f === void 0 ? name : _f, fileNameRender = _e.fileNameRender, actionRender = _e.actionRender, previewOnFileName = _e.previewOnFileName, others = __rest(_e, ["listType", "prefix", "dragable", "shape", "className", "style", "useDataURL", "disabled", "limit", "closable", "beforeUpload", "readonly", "onRemove", "onCancel", "onPreview", "list", "extraRender", "progressProps", "rtl", "isPreview", "renderPreview", "name", "fileKeyName", "fileNameRender", "actionRender", "previewOnFileName"]);
        var cls = classNames((_a = {},
            _a["".concat(prefix, "upload")] = true,
            _a["".concat(prefix, "upload-dragable")] = dragable,
            _a["".concat(prefix, "disabled")] = disabled,
            _a["".concat(prefix, "readonly")] = readonly,
            _a[className] = className,
            _a));
        var isExceedLimit = this.state.value.length >= limit;
        var innerCls = classNames((_b = {},
            _b["".concat(prefix, "upload-inner")] = true,
            _b["".concat(prefix, "hidden")] = isExceedLimit,
            _b));
        var children = this.props.children;
        if (shape === 'card') {
            var cardCls = classNames((_c = {},
                _c["".concat(prefix, "upload-card")] = true,
                _c["".concat(prefix, "disabled")] = disabled,
                _c));
            children = (React.createElement("div", { className: cardCls },
                React.createElement(Icon, { size: "large", type: "add", className: "".concat(prefix, "upload-add-icon") }),
                React.createElement("div", { tabIndex: "0", role: "button", className: "".concat(prefix, "upload-text") }, children)));
        }
        if (isPreview) {
            if (typeof renderPreview === 'function') {
                var previewCls = classNames((_d = {},
                    _d["".concat(prefix, "form-preview")] = true,
                    _d[className] = !!className,
                    _d));
                return (React.createElement("div", { style: style, className: previewCls }, renderPreview(this.state.value, this.props)));
            }
            if (listType) {
                return (React.createElement(List, { isPreview: true, listType: listType, style: style, className: className, value: this.state.value, onPreview: onPreview }));
            }
            return null;
        }
        // disabled 状态下把 remove函数替换成禁止 remove的函数
        var onRemoveFunc = disabled ? func.prevent : onRemove;
        var otherAttributes = obj.pickAttrsWith(this.props, 'data-');
        return (React.createElement("div", __assign({ className: cls, style: style }, otherAttributes),
            React.createElement(Uploader, __assign({}, others, { name: fileKeyName, beforeUpload: beforeUpload, dragable: dragable, disabled: disabled || isExceedLimit, className: innerCls, onSelect: this.onSelect, onDrop: this.onDrop, onProgress: this.onProgress, onSuccess: this.onSuccess, onError: this.onError, ref: this.saveUploaderRef }), children),
            (listType && listType !== 'none') || list ? (React.createElement(List, { useDataURL: useDataURL, fileNameRender: fileNameRender, actionRender: actionRender, uploader: this, listType: listType, value: this.state.value, closable: closable, onRemove: onRemoveFunc, progressProps: progressProps, onCancel: onCancel, onPreview: onPreview, extraRender: extraRender, rtl: rtl, previewOnFileName: previewOnFileName })) : null));
    };
    Upload.displayName = 'Upload';
    Upload.propTypes = __assign(__assign(__assign({}, html5Uploader.propTypes), List.propTypes), { 
        /**
         * 样式前缀
         */
        prefix: PropTypes.string.isRequired, 
        /**
         * 上传的地址
         */
        action: PropTypes.string, 
        /**
         * 文件列表
         */
        value: PropTypes.array, 
        /**
         * 默认文件列表
         */
        defaultValue: PropTypes.array, 
        /**
         * 上传按钮形状
         */
        shape: PropTypes.oneOf(['card']), 
        /**
         * 上传列表的样式
         * @enumdesc 文字, 图文, 卡片
         */
        listType: PropTypes.oneOf(['text', 'image', 'card', 'none']), list: PropTypes.any, 
        /**
         * 文件名字段
         */
        name: PropTypes.string, 
        /**
         * 上传额外传参
         */
        data: PropTypes.oneOfType([PropTypes.object, PropTypes.func]), 
        /**
         * 数据格式化函数，配合自定义 action 使用，参数为服务器的响应数据，详见 [formatter](#formater)
         * @param {Object} response 返回
         * @param {File} file 文件对象
         */
        formatter: PropTypes.func, 
        /**
         * 最大文件上传个数
         */
        limit: PropTypes.number, 
        /**
         * 设置上传超时,单位ms
         */
        timeout: PropTypes.number, 
        /**
         * 可选参数，是否支持拖拽上传，`ie10+` 支持。
         */
        dragable: PropTypes.bool, closable: PropTypes.bool, 
        /**
         * 可选参数，是否本地预览
         */
        useDataURL: PropTypes.bool, 
        /**
         * 可选参数，是否禁用上传功能
         */
        disabled: PropTypes.bool, 
        /**
         * 选择文件回调
         */
        onSelect: PropTypes.func, 
        /**
         * 上传中
         */
        onProgress: PropTypes.func, 
        /**
         * 上传文件改变时的状态
         * @param {Object} info 文件事件对象
         */
        onChange: PropTypes.func, 
        /**
         * 可选参数，上传成功回调函数，参数为请求下响应信息以及文件
         * @param {Object} file 文件
         * @param {Array<Object>} value 值
         */
        onSuccess: PropTypes.func, 
        /**
         * 可选参数, 用于校验文件,afterSelect仅在 autoUpload=false 的时候生效,autoUpload=true时,可以使用beforeUpload完全可以替代该功能.
         * @param {Object} file
         * @returns {Boolean} 返回false会阻止上传,其他则表示正常
         */
        afterSelect: PropTypes.func, 
        /**
         * 移除文件回调函数
         * @param {Object} file 文件
         * @returns {Boolean|Promise} 返回 false、Promise.resolve(false)、 Promise.reject() 将阻止文件删除
         */
        onRemove: PropTypes.func, 
        /**
         * 可选参数，上传失败回调函数，参数为上传失败的信息、响应信息以及文件
         * @param {Object} file 出错的文件
         * @param {Array} value 当前值
         */
        onError: PropTypes.func, 
        /**
         * 可选参数, 详见 [beforeUpload](#beforeUpload)
         * @param {Object} file 所有文件
         * @param {Object} options 参数
         * @returns {Boolean|Object|Promise} 返回值作用见demo
         */
        beforeUpload: PropTypes.func, 
        /**
         * 放文件
         */
        onDrop: PropTypes.func, 
        /**
         * 自定义class
         */
        className: PropTypes.string, 
        /**
         * 自定义内联样式
         */
        style: PropTypes.object, 
        /**
         * 子元素
         */
        children: PropTypes.node, 
        /**
         * 自动上传
         */
        autoUpload: PropTypes.bool, 
        /**
         * 自定义上传方法
         * @param {Object} option
         * @return {Object} object with abort method
         */
        request: PropTypes.func, 
        /**
         * 透传给Progress props
         */
        progressProps: PropTypes.object, rtl: PropTypes.bool, 
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
         * 文件对象的 key name
         * @version 1.21
         */
        fileKeyName: PropTypes.string, 
        /**
         * list 的自定义文件名渲染
         * @param {Object} file 文件
         * @return {Node} react node
         */
        fileNameRender: PropTypes.func, 
        /**
         * 操作区域额外渲染
         * @param {Object} file 文件
         * @return {Node} react node
         */
        actionRender: PropTypes.func, 
        /**
         * 点击文件名时触发 onPreview
         * @version 1.24
         */
        previewOnFileName: PropTypes.bool });
    Upload.defaultProps = __assign(__assign({}, html5Uploader.defaultProps), { prefix: 'next-', limit: Infinity, autoUpload: true, closable: true, onSelect: noop, onProgress: noop, onChange: noop, onSuccess: noop, onRemove: noop, onError: noop, onDrop: noop, beforeUpload: noop, afterSelect: noop, previewOnFileName: false });
    return Upload;
}(Base));
export default polyfill(Upload);
