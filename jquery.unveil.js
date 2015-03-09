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

    $.fn.unveil = function(vthreshold, hthreshold, index, callback) {

        var $w = $(window),
            box = window.box,
            vthreshold = vthreshold || 3,
            hthreshold = hthreshold || 7,
            retina = window.devicePixelRatio > 1,
            attrib = retina? "data-src-retina" : "data-src",
            index = index || 0,
            values = [];

        $.each(this, function(index, value) {
            values[index] = {
                index: 0,
                hthreshold: hthreshold,
                images: $(value).find('.lazy')
            };

            $(value).find('.lazy').on("unveil", function() {
                var source = this.getAttribute(attrib);
                source = source || this.getAttribute("data-src");
                if (source) {
                    this.setAttribute("src", source);
                    if (typeof callback === "function") callback.call(this);
                }
            });
        });

        // TODO: refactoring code
        function loadImages(currentIndex) {
            var currentHThreshold = hthreshold,
                currentIndexUndefined = false;

            if (currentIndex === undefined) {
                currentIndex = index;
                currentIndexUndefined = true;
            } 
            
            var value = values[currentIndex];

            if (value) {
                if (!currentIndexUndefined) {
                    currentHThreshold = value.hthreshold;
                    value.hthreshold = 1;
                }

                inview = value.images.slice(0, currentHThreshold),
                loaded = inview.trigger("unveil");
                value.images = value.images.not(loaded);
            }
        }

        function init() {
            for (var i = 0; i <= vthreshold; i++) {
                loadImages();
                index ++;
            }
            index -= vthreshold + 1;
        }

        function unveil(type) {
            switch (type) {
                case 'Down':
                    loadImages(index + vthreshold);
                    break;
                case 'Right':
                    var value = values[index],
                        currentIndex = value.index + hthreshold;

                    loadImages();
                    value.index ++;
                    break;
            }
        }

        if (box) {
            box.grabKey('Down', function() {
                if (index < values.length -1) {
                    index ++;
                    unveil('Down');
                }
            });

            box.grabKey('Up', function() {
                if (index > 0) {
                    index --;
                }
            });

            box.grabKey('Right', function() {
                unveil('Right');
            });
        }

        if (index == 0) {
            init();
        }

        return this;
    };

})(window.jQuery || window.Zepto);
