
/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://luis-almeida.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Luís Almeida
 * https://github.com/luis-almeida
 */

;(function($) {

    var values = [],
        context = {module: 'unveil'};

    $.fn.unveil = function(index, callback) {
        var box = window.box,
            vthreshold = 2,
            hthreshold = 7,
            attrib = "data-src",
            index = index || 0,
            insert = values.length > 0;

        if (values.length == 0 && box) {
            box.grabKey('Down', function() {
                if (index < values.length - 1) {
                    index ++;
                    unveil('Down');
                }
            }, context);

            box.grabKey('Up', function() {
                if (index >= 0) {
                    index --;
                }
            }, context);

            box.grabKey('Right', function() {
                unveil('Right');
            }, context);
        }

        if(callback === undefined) {
            values = [];
            box.freeKey('Down', context);
            box.freeKey('Up', context);
            box.freeKey('Right', context);
            return;
        }

        $(this).each(function(idx, val) {
            var currentIndex = 0;

            if (insert) {
                currentIndex = index + idx;
                for (var i = values.length - 1; i >= currentIndex; i --) {
                    values[i].index = i + 1;
                    values[i + 1] = values[i];
                    values[i] = null;
                }
            }
            else {
                currentIndex = idx;
            }

            var value = values[currentIndex] = {
                hthreshold: hthreshold,
                index: currentIndex
            };

            $(value).on("unveil", function() {
                $('div.mosaic-area--' + this.index).find('ul>li>img:not([src])').each(function(idx, val) {
                    if (idx > value.hthreshold) return false;

                    var source = this.getAttribute(attrib);
                    source = source || this.getAttribute("data-src");
                    if (source) {
                        this.setAttribute("src", source);
                        if (typeof callback === "function") callback.call(this);
                    }
                    source = null;
                });
            });
        });

        function unveil(type) {
            switch (type) {
                case 'Down':
                    /*
                     * 1. load first one image of this line
                     * 2. load first hthreshold images of line vthreshold after
                     * this line
                     */
                    var value = values[index];

                    value.hthreshold = 1;
                    $(value).trigger('unveil');
                    value.hthreshold = hthreshold;

                    value = values[index + vthreshold];
                    if (value) 
                        $(value).trigger('unveil');
                   
                    value = null;
                    break;
                case 'Right':
                    /*
                     * load first hthreshold images of this line
                     */
                    $(values[index]).trigger('unveil');
                    break;
                default:
                    /*
                     * if is inserted
                     *      load images of this line
                     * else
                     *      load first hthreshold images of frist vthreshold lines 
                     */

                    if (insert) {
                        $(values[index]).trigger('unveil');
                    } else {
                        for (var i = index; i < vthreshold; i ++) {
                            $(values[i]).trigger('unveil');
                        }
                    }

                    break;
            }
        }

        unveil();

        return this;
    };

})(window.jQuery || window.Zepto);
