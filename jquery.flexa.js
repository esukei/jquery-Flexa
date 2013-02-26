/**
 * jQuery Flexa v0.1.1
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
		// force scene position 'absolute'
		sceneStyle = {
			position: 'absolute'
		},
		//play scene
		playScene = function (sceneId) {
			var
				$this              = $(this),
				thisData           = $this.data(),
				scenes             = thisData.scenes,
				nextScene       = scenes[sceneId],
				nextSceneLength = nextScene.length,
				i = 0;
			
			for(i; i < nextSceneLength; ++i) {
				nextScene[i]
					.playSavedAnimation()
					.dequeue();
			}

		},
		//play next scene
		playNext = function (timing) {
			var
				$this = $(this),
				thisData = $this.data(),
				currentSceneId = thisData.currentSceneId,
				scenes = thisData.scenes,
				scenesLength = scenes.length,
				nextSceneId = thisData.nextSceneId;
			
			if(nextSceneId === currentSceneId) return false;
			
			if(scenes[nextSceneId][0].data('inTiming') === timing)
			{
				playScene.call(this, nextSceneId);

				currentSceneId = nextSceneId;
				
				if(currentSceneId === scenesLength - 1) {
					if(thisData.loop) {
						nextSceneId = 0;
					}
				} else {
					nextSceneId = currentSceneId + 1;
				}
				
				$this.data({
					currentSceneId: currentSceneId,
					nextSceneId: nextSceneId
				});
				
				return true;
			}
			return false;
		},
		//trigger animation event
		triggerFlexaEvent = function (type) {

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
			
			//trigger if scene is the last sub scene of current scene
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
			playNext.call(this, 'cross');
		},
		animationEndHandler = function (event) {
			var
				$this = $(this);

			if(event.sceneId === $this.data('currentSceneId')) {
				playNext.call(this, 'sequence');
			}

			if(event.sceneId === $this.data('nextSceneId')) {
				$this.trigger({
					type: 'animationstopflexa',
					sceneId: event.sceneId
				});
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
		//show scene
		showScene = function (next) {
			$(this).show();
			next();
		},
		//hide scnen
		hideScene = function (next) {
			var
				$this = $(this);
			if($this.data('outHidden')) $this.hide();
			next();
		},
		//trigger animation start event
		triggerAnimationStart = function (next) {
			triggerFlexaEvent.call(this, 'animationstartflexa');
			next();
		},
		//trigger animation wait start event
		triggerWaitStart = function (next) {
			triggerFlexaEvent.call(this, 'waitstartflexa');
			next();
		},
		//trigger animation wait end event
		triggerWaitEnd = function (next) {
			triggerFlexaEvent.call(this, 'waitendflexa');
			next();
		},
		//trigger animation end event
		triggerAnimationEnd = function (next) {
			triggerFlexaEvent.call(this, 'animationendflexa');
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
		getStyle = function(transitions, frameDimension, sceneDimension) {
			var
				transitionArray = transitions.split(" "),
				transitionLength = transitionArray.length,
				rightPosition = (frameDimension.width > sceneDimension.width) ? frameDimension.width : sceneDimension.width,
				bottomPosition = (frameDimension.height > sceneDimension.height) ? frameDimension.height : sceneDimension.height,
				verticalCenter = (sceneDimension.width - frameDimension.width) / 2,
				horizontalCenter = (sceneDimension.height - frameDimension. height) / 2,
				leftStyle = {
					left: -sceneDimension.width + 'px'
				},
				rightStyle = {
					left: rightPosition + 'px'
				},
				topStyle = {
					top: -sceneDimension.width + 'px'
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
						$scene = $(this),
						sceneDimension = {
							width: $scene.outerWidth(),
							height: $scene.outerHeight()
						},
						sceneOptions = buildOptions($scene.data(), thisOptions);
	
					sceneOptions.frame = $this;
					
					//build scenes
					if(sceneOptions.inTiming === "same") {
						scenes[scenes.length - 1].push($scene);
					} else {
						scenes.push([$scene]);
					}
	
					//save scene id
					sceneOptions.sceneId = scenes.length - 1;
					sceneOptions.subSceneId = scenes[sceneOptions.sceneId].length - 1;
					
					//save styles for animation
					sceneOptions.inStyle = getStyle(sceneOptions.inTransition, thisDimension, sceneDimension);
					sceneOptions.inStyle.zIndex = 1100;
					sceneOptions.waitStyle = getStyle('none', thisDimension, sceneDimension);
					sceneOptions.outStyle = getStyle(sceneOptions.outTransition, thisDimension, sceneDimension);
					sceneOptions.outStyle.zIndex = 1000;
					
					//save animation setting
					sceneOptions.inAnimation = {
						duration: sceneOptions.inDuration,
						easing: sceneOptions.inEasing
					};
					sceneOptions.outAnimation = {
						duration: sceneOptions.outDuration,
						easing: sceneOptions.outEasing
					};
					
					//save all parameters except scene frame's data
					$scene.data({
						frame: sceneOptions.frame,
						wait: sceneOptions.wait,
						inDuration: sceneOptions.inDuration,
						outDuration: sceneOptions.outDuration,
						inEasing: sceneOptions.inEasing,
						outEasing: sceneOptions.outEasing,
						inTransition: sceneOptions.inTransition,
						outTransition: sceneOptions.outDuration,
						outHidden: sceneOptions.outHidden,
						inTiming: sceneOptions.inTiming,
						inDelay: sceneOptions.inDelay,
						inStyle: sceneOptions.inStyle,
						waitStyle: sceneOptions.waitStyle,
						outStyle: sceneOptions.outStyle,
						sceneId: sceneOptions.sceneId,
						subSceneId: sceneOptions.subSceneId
					});
					//build animation queue and save
					$scene
						//hide and set default style
						.hide()
						.css(sceneStyle)
						//pause for preventing animation start and trigger events
						.pauseQueue()
						.queue(showScene)
						.queue(setInStyle)
						//in animation
						.queue(triggerAnimationStart)
						//in delay
						.delay(sceneOptions.inDelay)
						.animate(sceneOptions.waitStyle, sceneOptions.inAnimation)
						//start waiting
						.queue(triggerWaitStart)
						.delay(sceneOptions.wait)
						.queue(triggerWaitEnd)
						//out animation
						.animate(sceneOptions.outStyle, sceneOptions.outAnimation)
						.queue(triggerAnimationEnd)
						//hide
						.queue(hideScene)
						//save animation
						.saveAnimation()
						//delete all queue above
						.clearQueue();
			});
			
			//save scenes
			thisOptions.scenes = scenes;
			//save scene Id for initial start
			thisOptions.currentSceneId = 0;
			thisOptions.nextSceneId = 1;
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
					playScene.call($this, 0);
				} else {
					//add on load event
					$win.on('load', function (event) {
						playScene.call($this, 0);
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