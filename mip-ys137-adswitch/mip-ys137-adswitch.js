/**
 * @author: mj
 * @date:  2018-04-08
 * @time: 14:39
 * @file: mip-ys137-adswitch.js
 * @contact: regboy@qq.com
 * @description: 控制广告展现
 */
define(function (require) {
    var customElem = require('customElement').create();
    var switchAd = {
        // 获取当前时间戳
        // datestr：yyyy-mm-dd hh:ii:ss
        nowTime: function () {
            return this.getTime('');
        },
        getTime: function (datestr) {
            var date = new Date();
            if (this.isEmpty(datestr)) {
                date = new Date();
            }
            else {
                // 修复在safari下获取时间戳为NaN
                datestr = datestr.replace(/-/g, '/');
                date = new Date(datestr);
            }
            return Math.round(date.getTime() / 1000);
        },
        isEmpty: function (obj) {
            if (typeof obj === 'undefined' || obj === null || obj === '') {
                return true;
            }
            return false;
        },
        // 关键词是否包含在标题中
        keywordIsContain: function (keyword) {
            var titleArr = [];
            if (document.querySelector('meta[property="og:title"]')) {
                titleArr.push(document.querySelector('meta[property="og:title"]').getAttribute('content'));
            }
            else {
                if (document.title) {
                    titleArr.push(document.title);
                }
            }
            if (document.querySelector('meta[name="Keywords"]')) {
                titleArr.push(document.querySelector('meta[name="Keywords"]').getAttribute('content'));
            }
            var title = '';
            if (titleArr.length > 0) {
                title = titleArr.join(',');
            }
            var t = this;
            if (this.isEmpty(title)) {
                return false;
            }
            var exists = false; // 是否存在
            if (!this.isEmpty(keyword)) {
                var arr = keyword.split(',');
                arr.every(function (val, index) {
                    if (!t.isEmpty(val)) {
                        if (title.indexOf(val) !== -1) {
                            exists = true;
                            return false;
                        }
                        return true;
                    }
                });
            }
            return exists;
        },
        // 路径是否包含
        pathIsContain: function (path) {
            var currentPath = window.location.pathname;
            var t = this;
            if (this.isEmpty(path)) {
                return false;
            }
            var exists = false; // 是否存在
            if (!this.isEmpty(path)) {
                var arr = path.split(',');
                arr.every(function (val, index) {
                    if (!t.isEmpty(val)) {
                        var reg = new RegExp('^' + val);
                        if (reg.test(currentPath)) {
                            exists = true;
                            return false;
                        }
                        return true;
                    }
                });
            }
            return exists;
        },
        //  switchAdshow
        //  根据条件展现广告
        //  adHTML：广告HTML
        //  start_time：广告展现开始时间戳，小于或者等于0则立即显示
        //  end_time：广告展现结束时间戳，小于或者等于0则一直显示
        //  keyword：标题中出现有相关词时展现，多个词之间用英文逗号分隔，如：血糖,淋巴,胃疼
        //  path：指定路径展现，相对路径，如：/slys/，表示此目录下时才展现广告，多个目录之间用英文逗号分隔
        //  defaultHTML:不展现自定义广告时，显示的填充信息
        show: function (adHTML, startDate, endDate, keyword, path, defaultHTML) {
            var isValid = true; // 广告是否在有效展现时间内
            // 判断广告是否在有效展现时间内
            if (!this.isEmpty(startDate) && this.getTime(startDate) > this.nowTime()) {
                isValid = false;
            }
            if (!this.isEmpty(endDate) && this.getTime(endDate) < this.nowTime()) {
                isValid = false;
            }
            var keywordHit = true; // 条件命中
            if (!this.isEmpty(keyword)) {
                // 判断标题是否存在相关的关键词
                var isExists = this.keywordIsContain(keyword);
                if (isExists) {
                    keywordHit = true;
                }
                else {
                    keywordHit = false;
                }
            }
            var pathHit = true; // 条件命中
            if (!this.isEmpty(path)) {
                // 判断标题是否存在相关的关键词
                var isExists = this.pathIsContain(path);
                if (isExists) {
                    pathHit = true;
                }
                else {
                    pathHit = false;
                }
            }
            if (this.isEmpty(adHTML)) {
                isValid = false;
            }
            if (isValid === true && keywordHit === true && pathHit === true) {
                return adHTML;
            }
            else {
                return defaultHTML;
            }
        }
    };
    // 初始化插件
    var init = function (element) {
        var adHtml = element.getAttribute('adhtml');
        var defaultHtml = element.getAttribute('defaulthtml');
        var startDate = element.getAttribute('startdate');
        var endDate = element.getAttribute('enddate');
        var keyword = element.getAttribute('keyword');
        var path = element.getAttribute('path');
        element.innerHTML = switchAd.show(adHtml, startDate, endDate, keyword, path, defaultHtml);
    };

    // build 方法，元素插入到文档时执行，仅会执行一次
    customElem.prototype.build = function () {
        // this.element 可取到当前实例对应的 dom 元素
        init(this.element);
    };
    // 第一次进入可视区回调,只会执行一次，做懒加载，利于网页速度
    customElem.prototype.firstInviewCallback = function () {
        // var opt = getOpt(this.element);
        // opt.lazy !== 'false' && init(opt);
    };
    return customElem;
});
