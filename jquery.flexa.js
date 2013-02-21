/**
 * jQuery Flexa v0.1.0
 * Flexible Animation builder
 * https://github.com/esukei/jquery-flexa
 * Copyright 2013 Satoru Kawahara
 * Licensed under MIT(http://www.opensource.org/licenses/MIT)
 */
(function(window, $, undefined) {
	var
		$win = $(window),
		// default options
		_options = {
			autoplay: true,
			loop: true,
			wait: 3000,
			duration: 1000,
			inDuration: null,
			outDuration: null,
			easing: 'linear',
			inEasing: null,
			outEasing: null,
			transition: 'fade',
			inTransition: null,
			outTransition: null,
			outHidden: true,
			inTiming: 'cross',
			inDelay: 0
		},
		// force slide position 'absolute'
		slideStyle = {
			position: 'absolute'
		},
		//
		playSlide = function () {
			var
				$this              = $(this),
				thisData           = $this.data(),
				previousSceneId    = thisData.currentSceneId,
				scenes             = thisData.scenes,
				scenesLength       = scenes.length,
				currentSceneId     = thisData.nextSceneId,
				currentScene       = scenes[currentSceneId],
				currentSceneLength = currentScene.length,
				nextSceneId,
				i = 0;
			
			//
			if(currentSceneId === previousSceneId) return;
			
			for(i; i < currentSceneLength; ++i) {
				currentScene[i]
					.playSavedAnimation()
					.dequeue();
			}

			if(currentSceneId === scenesLength - 1) {
				if(thisData.loop) {
					nextSceneId = 0;
				} else {
					nextSceneId = currentSceneId;
				} 
			} else {
				nextSceneId = currentSceneId + 1;
			}
			
			$this.data({
				currentSceneId: currentSceneId,
				nextSceneId: nextSceneId
			});
		},
		playNext = function (timing) {
			var
				$this = $(this),
				thisData = $this.data(),
				scenes = thisData.scenes,
				nextSceneId = thisData.nextSceneId;
			
			if(scenes[nextSceneId][0].data('inTiming') === timing) playSlide.call(this);
		},
		//trigger slideshow event
		triggerSlideshowEvent = function (type) {

			var
				$this = $(this),
				thisData = $this.data(),
				$frame = thisData.frame,
				sceneId = thisData.sceneId,
				subSceneId = thisData.subSceneId,
				scenes = $frame.data('scenes'),
				subSceneLength = scenes[sceneId].length,
				event = {
					type: type,
					sceneId: sceneId
				};

			//trigger if slide is the last sub scene of current scene
			if(subSceneId === subSceneLength - 1) $frame.trigger(event);
		},
		/**
		 * event handlers
		 */
		animationStartHandler = function (event) {
			var
				$this = $(this);
		},
		waitStartHandler = function (event) {
			var
				$this = $(this);
			$this.data('isWaiting', true);
		},
		waitEndHandler = function (event) {
			var
				$this = $(this);
			$this.data('isWaiting', false);

			if($this.data('sceneId') !== $this.data('nextSceneId')) playNext.call(this, 'cross');
		},
		animationEndHandler = function (event) {
			var
				$this = $(this);

			if($this.data('sceneId') !== $this.data('nextSceneId')) {
				playNext.call(this, 'sequence')
			} else {
				//trigger all end
				console.log('stop');
			}
		},
		/**
		 * functions for queue
		 */
		//set style for "in" animation 
		setInStyle = function (next) {
			var
				$this = $(this);
			$this.css($this.data('inStyle'));
			next();
		},
		//show slide
		showSlide = function (next) {
			$(this).show();
			next();
		},
		//hide slide
		hideSlide = function (next) {
			var
				$this = $(this);
			if($this.data('outHidden')) $this.hide();
			next();
		},
		//trigger animation start event
		triggerAnimationStart = function (next) {
			triggerSlideshowEvent.call(this, 'animationstartflexa');
			next();
		},
		//trigger animation wait start event
		triggerWaitStart = function (next) {
			triggerSlideshowEvent.call(this, 'waitstartflexa');
			//set waiting flag
			$(this)
				.data('frame')
				.data('isWaiting', true);
			next();
		},
		//trigger animation wait end event
		triggerWaitEnd = function (next) {
			triggerSlideshowEvent.call(this, 'waitendflexa');
			//unset waiting flag
			$(this)
				.data('frame')
				.data('isWaiting', false);
			next();
		},
		//trigger animation end event
		triggerAnimationEnd = function (next) {
			triggerSlideshowEvent.call(this, 'animationendflexa');
			next();
		},
		/**
		 * init options
		 */
		cascadeOptions = function(optionsObject, targetKey, defaultKey) {
			if(optionsObject[targetKey] === null) optionsObject[targetKey] = optionsObject[defaultKey];
		},
		buildOptions = function (targetData, defaultOptions) {
			var
				options = {};
			$.extend(options, defaultOptions, targetData);

			cascadeOptions(options, 'inDuration', 'duration');
			cascadeOptions(options, 'outDuration', 'duration');
			cascadeOptions(options, 'inEasing', 'easing');
			cascadeOptions(options, 'outEasing', 'easing');
			cascadeOptions(options, 'inTransition', 'transition');
			cascadeOptions(options, 'outTransition', 'transition');

			return options;
		},
		//build and get styles for animation
		getStyle = function(transitions, frameDimension, slideDimension) {
			var
				transitionArray = transitions.split(" "),
				transitionLength = transitionArray.length,
				rightPosition = (frameDimension.width > slideDimension.width) ? frameDimension.width : slideDimension.width,
				bottomPosition = (frameDimension.height > slideDimension.height) ? frameDimension.height : slideDimension.height,
				verticalCenter = (slideDimension.width - frameDimension.width) / 2,
				horizontalCenter = (slideDimension.height - frameDimension. height) / 2,
				leftStyle = {
					left: -slideDimension.width + 'px'
				},
				rightStyle = {
					left: rightPosition + 'px'
				},
				topStyle = {
					top: -slideDimension.width + 'px'
				},
				bottomStyle = {
					top: bottomPosition + 'px'
				},
				fadeStyle = {
					opacity: 0
				},
				noneStyle = {
					opacity: 1,
					left: horizontalCenter + 'px',
					top: verticalCenter + 'px'
				},
				returnStyle = $.extend({}, noneStyle),
				i = 0;

			for(i; i < transitionLength; ++i){
				switch(transitionArray[i]) {
					case 'left':
						$.extend(returnStyle, leftStyle);
						break;
					case 'right':
						$.extend(returnStyle, rightStyle);
						break;
					case 'top':
						$.extend(returnStyle, topStyle);
						break;
					case 'bottom':
						$.extend(returnStyle, bottomStyle);
						break;
					case 'fade':
						$.extend(returnStyle, fadeStyle);
						break;
					case 'none':
						$.extend(returnStyle, noneStyle);
						break;
				}
			}
			return returnStyle;
		},
		//init
		init = function (i) {
			var
				$this = $(this),
				thisOptions = buildOptions($this.data(), _options),
				thisDimension = {
					width: $this.outerWidth(),
					height: $this.outerHeight()
				},
				scenes = [];
			
			$this
				.children()
				.each(function (i) {
					var
						$slide = $(this),
						slideDimension = {
							width: $slide.outerWidth(),
							height: $slide.outerHeight()
						},
						slideOptions = buildOptions($slide.data(), thisOptions);
	
					slideOptions.frame = $this;
					
					//build scenes
					if(slideOptions.inTiming === "same") {
						scenes[scenes.length - 1].push($slide);
					} else {
						scenes.push([$slide]);
					}
	
					//save scene id
					slideOptions.sceneId = scenes.length - 1;
					slideOptions.subSceneId = scenes[slideOptions.sceneId].length - 1;
					
					//save styles for animation
					slideOptions.inStyle = getStyle(slideOptions.inTransition, thisDimension, slideDimension);
					slideOptions.inStyle.zIndex = 1100;
					slideOptions.waitStyle = getStyle('none', thisDimension, slideDimension);
					slideOptions.outStyle = getStyle(slideOptions.outTransition, thisDimension, slideDimension);
					slideOptions.outStyle.zIndex = 1000;
					
					//save animation setting
					slideOptions.inAnimation = {
						duration: slideOptions.inDuration,
						easing: slideOptions.inEasing
					};
					slideOptions.outAnimation = {
						duration: slideOptions.outDuration,
						easing: slideOptions.outEasing
					};
					
					//save all parameters except slide frame's data
					$slide.data({
						frame: slideOptions.frame,
						wait: slideOptions.wait,
						inDuration: slideOptions.inDuration,
						outDuration: slideOptions.outDuration,
						inEasing: slideOptions.inEasing,
						outEasing: slideOptions.outEasing,
						inTransition: slideOptions.inTransition,
						outTransition: slideOptions.outDuration,
						outHidden: slideOptions.outHidden,
						inTiming: slideOptions.inTiming,
						inDelay: slideOptions.inDelay,
						inStyle: slideOptions.inStyle,
						waitStyle: slideOptions.waitStyle,
						outStyle: slideOptions.outStyle,
						sceneId: slideOptions.sceneId,
						subSceneId: slideOptions.subSceneId
					});
	
					//build animation queue and save
					$slide
						//hide and set default style
						.hide()
						.css(slideStyle)
						//pause for preventing animation start and trigger events
						.pauseQueue()
						.queue(showSlide)
						.queue(setInStyle)
						//in animation
						.queue(triggerAnimationStart)
						//in delay
						.delay(slideOptions.inDelay)
						.animate(slideOptions.waitStyle, slideOptions.inAnimation)
						//start waiting
						.queue(triggerWaitStart)
						.delay(slideOptions.wait)
						.queue(triggerWaitEnd)
						//out animation
						.animate(slideOptions.outStyle, slideOptions.outAnimation)
						.queue(triggerAnimationEnd)
						//hide
						.queue(hideSlide)
						//save animation
						.saveAnimation()
						//delete all queue above
						.clearQueue();
			});
			
			//save scenes
			thisOptions.scenes = scenes;
			//save scene Id for initial start
			thisOptions.currentSceneId = -1;
			thisOptions.nextSceneId = 0;
			//init waiting flag
			thisOptions.isWaiting = false;
			
			//save data and attach event handlers
			$this
				.data(thisOptions)
				.on('animationstartflexa', animationStartHandler)
				.on('waitstartflexa', waitStartHandler)
				.on('waitendflexa', waitEndHandler)
				.on('animationendflexa', animationEndHandler);
			
			//autoplay
			if(thisOptions.autoplay) {
				//already loaded run immediately
				if(document.readyState === 'complete') {
					playSlide.call($this, 0);
				} else {
					//add on load event
					$win.on('load', function (event) {
						playSlide.call($this, 0);
					});
				}
			}
		};
	
	$.fn.extend({
		//plugin main
		flexa: function () {
			return this.each(init);
		},
		/**
		 * animation utility
 		 */
		// pause animation. dequeue to continue.
		pauseQueue: function () {
			return this.queue($.noop);
		},
		// save queued animations to the element's data.
		saveAnimation: function (saveKey) {
			var _saveKey = saveKey || 'flexaQueue';
			return this.each(function (i) {
				var
					$this = $(this);
				$this.data(_saveKey, $this.queue());
			});
		},
		// re-queue saved animation
		playSavedAnimation: function (savedKey) {
			var _savedKey = savedKey || 'flexaQueue';
			return this.each(function (i) {
				var
					$this = $(this);
				$this.queue($this.data(_savedKey));
			});
		}
	});
	
	$(function(){
		$('[data-flexa-enable="true"]').flexa();
	});
	
})(this, jQuery);