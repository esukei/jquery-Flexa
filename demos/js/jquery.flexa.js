/**
 * jQuery Flexa v0.1.2
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
		highZIndex = 2000,
		lowZIndex = 1000,
		//set style for "in" animation 
		setLowerZIndex = function (next) {
			var
				$this = $(this);
			$this.css({zIndex: lowZIndex});
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
		cascadeOption = function(options, defaultOptions, defaultKey, inKey, outKey) {
			if(options[defaultKey] == undefined){
				options[defaultKey] = defaultOptions[defaultKey];
				if(options[inKey] == undefined) options[inKey] = defaultOptions[inKey] || options[defaultKey];
				if(options[outKey] == undefined) options[outKey] = defaultOptions[outKey] || options[defaultKey];
			} else {
				if(options[inKey] == undefined) options[inKey] = options[defaultKey];
				if(options[outKey] == undefined) options[outKey] = options[defaultKey];
			}
		},
		buildOptions = function (targetData, defaultOptions) {
			var
				options = $.extend({}, targetData);

			cascadeOption(options, defaultOptions, 'duration', 'inDuration', 'outDuration');
			cascadeOption(options, defaultOptions, 'transition', 'inTransition', 'outTransition');
			cascadeOption(options, defaultOptions, 'easing', 'inEasing', 'outEasing');

			return $.extend({}, defaultOptions, options);
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
				styles = {
					left : {
						left: -sceneDimension.width + 'px'
					},
					right : {
						left: rightPosition + 'px'
					},
					top : {
						top: -sceneDimension.width + 'px'
					},
					bottom : {
						top: bottomPosition + 'px'
					},
					fade : {
						opacity: 0
					},
					none : {
						opacity: 1,
						left: horizontalCenter + 'px',
						top: verticalCenter + 'px'
					}
				},
				returnStyle = $.extend({}, styles.none),
				i = 0,
				transitionStyle;

			for(i; i < transitionLength; ++i){
				transitionStyle = styles[transitionArray[i]];
				if(transitionStyle === undefined) continue;
				$.extend(returnStyle, transitionStyle);
			}
			
			return returnStyle;
		},
		//init
		init = function (i) {
			var
				$this = $(this),
				thisData = $this.data(),
				thisOptions = buildOptions(thisData, _options),
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
						sceneData = $scene.data(),
						sceneDimension = {
							width: $scene.outerWidth(),
							height: $scene.outerHeight()
						},
						sceneOptions = buildOptions(sceneData, thisOptions);
					
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
					sceneOptions.inStyle.zIndex = highZIndex;
					sceneOptions.waitStyle = getStyle('none', thisDimension, sceneDimension);
					sceneOptions.outStyle = getStyle(sceneOptions.outTransition, thisDimension, sceneDimension);
					
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
						.queue(setLowerZIndex)
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