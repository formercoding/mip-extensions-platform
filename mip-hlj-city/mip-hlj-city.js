/**
 * @file mip-hlj-city 城市选择组件
 * @author kong_kong@hunliji.com
 */

define(function (require) {
    'use strict';
    var util = require('util');
    var $ = require('zepto');
    var CustomStorage = util.customStorage;
    var storage = new CustomStorage(0);
    // 存储城市信息
    var data;
    // 最近访问城市key
    var cityStorageKey;

    var customElement = require('customElement').create();

    function initProvince(element, provinces, hots) {
        var html = '<li><a data-id="" class="active">推荐</a></li>';
        for (var i = 0; i < provinces.length; i++) {
            html += '<li><a data-id=' + provinces[i].short_name + '>' + provinces[i].short_name + '</a></li>';
        }

        $(element).find('#province').html(html);

        $(element).find('#province a').on('click', function (e) {
            var id = e.currentTarget.dataset.id;
            $(element).find('#province a').removeClass('active');
            $(this).addClass('active');

            if (id) {
                for (var i = 0; i < provinces.length; i++) {
                    if (provinces[i].short_name === id) {
                        initCitys(element, provinces[i].children);
                        break;
                    }
                }
                $('.hots').hide();
                $('.citys').show();
            }
            else {
                $('.hots').show();
                $('.citys').hide();
                initHots(element, hots);
            }
        });
    }

    function initCitys(element, citys) {
        var html = '';

        for (var i = 0; i < citys.length; i++) {
            html += '<li><a data-id=' + citys[i].cid + '>' + citys[i].short_name + '</a></li>';
        }

        $(element).find('#citys').html(html);
        $(element).find('#groups').html('');

        $(element).find('#citys a').on('click', function (e) {
            var id = e.currentTarget.dataset.id;
            $(element).find('#citys a').removeClass('active');
            $(this).addClass('active');

            for (var i = 0; i < citys.length; i++) {
                if (citys[i].cid === id) {
                    initGroups(element, citys[i].children, citys[i]);
                    break;
                }
            }
        });
    }

    function initGroups(element, groups, city) {
        var html = '<li><a data-id=' + city.cid + ' href=' + '/baidu/package/city_'
        + city.cid + '>' + city.short_name + '城区</a></li>';
        for (var i = 0; i < groups.length; i++) {
            html += '<li><a data-id=' + groups[i].cid + ' href=' + '/baidu/package/city_'
            + groups[i].cid + '>' + groups[i].area_name + '</a></li>';
        }

        $(element).find('#groups').html(html);
        $(element).find('#groups a').on('click', stopDefaultEvent);
    }

    function initHots(element, hots) {
        var html = '';

        for (var i = 0; i < hots.length; i++) {
            if (hots[i].is_near === 1 || hots[i].is_near === '1') {
                html += '<li><a data-id=' + hots[i].cid + ' href=' + '/baidu/package/city_'
                + hots[i].cid + ' class="closter">' + hots[i].name + '</a></li>';
            }
            else if (hots[i].is_lvpai === 1 || hots[i].is_lvpai === '1') {
                html += '<li><a data-id=' + hots[i].cid + ' href=' + '/baidu/package/city_'
                + hots[i].cid + ' class="trip">' + hots[i].name + '</a></li>';
            }
            else {
                html += '<li><a data-id=' + hots[i].cid + ' href=' + '/baidu/package/city_'
                + hots[i].cid + '>' + hots[i].name + '</a></li>';
            }
        }

        $(element).find('#hots-city').html(html);
        $(element).find('#hots-city a').on('click', stopDefaultEvent);
    }

    function initLastCitys(element) {
        var lastCity = JSON.parse(storage.get(cityStorageKey));
        if (!lastCity) {
            return;
        }

        var html = '';
        for (var i = 0; i < lastCity.length; i++) {
            html += '<li><a data-id=' + lastCity[i].cid + ' href=' + '/baidu/package/city_'
            + lastCity[i].cid + '>' + lastCity[i].short_name + '</a></li>';
        }

        $(element).find('#last-city').html(html);
        $(element).find('#last-city-title').show();
        $(element).find('#last-city').css('display', 'flex');
        $(element).find('#last-city a').on('click', stopDefaultEvent);
    }

    function inputEvent(element) {
        $(element).find('#search').on('focus', function (e) {
            $(element).find('.input-group').addClass('focus');
            $(element).find('.panel').hide();
            $(element).find('.search-content').show();
        });


        // $(element).find("#search").on("blur", function(e) {
        //     $(element).find(".input-group").removeClass("focus");
        //     $(element).find('.panel').show();
        //     $(element).find('.search-content').hide();
        // });

        $(element).find('.cancel').on('click', function (e) {
            $(element).find('.input-group').removeClass('focus');
            $(element).find('.panel').show();
            $(element).find('.search-content').hide();
        });

        $(element).find('#search').on('input', function (e) {
            $(element).find('.search-content ul').html('');
            var value = e.currentTarget.value;
            var html = '';
            if (value && /[\u4e00-\u9fa5]/.test(value)) {
                html = findCitys(data.list, value, 'short_name');
                $(element).find('.search-content ul').html(html);
            }
            else if (value && /[a-zA-Z]/.test(value)) {
                html = findCitys(data.list, value, 'pinyin');
                $(element).find('.search-content ul').html(html);
            }

            $(element).find('.search-content a').on('click', stopDefaultEvent);
        });
    }

    function findCitys(provinces, value, type) {
        var html = '';

        // 循环 省
        for (var i = 0; i < provinces.length; i++) {
            if (!provinces[i].children || provinces[i].children.length === 0) {
                continue;
            }

            var citys = provinces[i].children;
            // 循环市
            for (var j = 0; j < citys.length; j++) {
                // 是否拼接
                var flag = false;
                if (citys[j][type].indexOf(value) > -1) {
                    flag = true;
                    html += '<li><a data-id=' + citys[j].cid + ' href=' + '/baidu/package/city_'
                    + citys[j].cid + '>' + citys[j].short_name + '</a></li>';
                }

                if (!citys[j].children || citys[j].children.length === 0) {
                    continue;
                }

                var groups = citys[j].children;
                for (var k = 0; k < groups.length; k++) {
                    if (groups[k][type].indexOf(value) > -1 || flag) {
                        html += '<li><a data-id=' + groups[k].cid + ' href='
                        + '/baidu/package/city_' + groups[k].cid + '>'
                        + citys[j].short_name + ',' + groups[k].short_name + '</a></li>';
                    }
                }
            }
        }

        return html;
    }

    // 通过城市id查找城市信息
    function findCityById(provinces, id) {
        // 循环 省
        for (var i = 0; i < provinces.length; i++) {
            if (!provinces[i].children || provinces[i].children.length === 0) {
                continue;
            }

            var citys = provinces[i].children;
            // 循环市
            for (var j = 0; j < citys.length; j++) {
                if (citys[j].cid === id) {
                    return citys[j];
                }

                if (!citys[j].children || citys[j].children.length === 0) {
                    continue;
                }

                var groups = citys[j].children;
                for (var k = 0; k < groups.length; k++) {
                    if (groups[k].cid === id) {
                        return groups[k];
                    }
                }
            }
        }

        return null;
    }



    // 阻止默认的跳转事件 存储最近城市
    function stopDefaultEvent(e) {
        e.preventDefault();
        var id = e.currentTarget.dataset.id;
        var lastCity = JSON.parse(storage.get(cityStorageKey));
        var resultCity = findCityById(data.list, id);
        var currentCity;

        if (!resultCity) {
            location.href = '/baidu/package/city_' + id;
            return;
        }

        currentCity = {
            'area_name': resultCity['area_name'],
            cid: resultCity.cid,
            pinyin: resultCity.pinyin,
            'short_name': resultCity['short_name']
        };

        if (!lastCity) {
            storage.set(cityStorageKey, JSON.stringify([currentCity]));
        }
        else {
            var newCitys = [currentCity];
            for (var i = 0; i < lastCity.length; i++) {
                if (lastCity[i].cid === currentCity.cid) {
                    continue;
                }
                newCitys.push(lastCity[i]);

                if (newCitys.length >= 3) {
                    break;
                }
            }
            storage.set(cityStorageKey, JSON.stringify(newCitys));
        }

        location.href = '/baidu/package/city_' + id;
    }

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        var element = this.element;
        var url = element.dataset.api;
        cityStorageKey = element.dataset.cityStorageKey;

        inputEvent(element);
        initLastCitys(element);

        // 请求数据
        fetch(url).then(function (res) {
            return res.json();
        }).then(function (res) {
            if (!res.status.RetCode) {
                data = res.data;
                initProvince(element, res.data.list, res.data.hot_city);
                initHots(element, res.data.hot_city);
            }
        });
        // TODO
    };

    return customElement;
});
