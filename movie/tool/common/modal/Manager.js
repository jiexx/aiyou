(function() {
	var Manager =  {
		tasks:{},
		path: '',
		_listenerClick: null,
		
		newTask: function(name) {  //web op
			var t = Task.create(name);
			this.tasks[t.id] = t;
			return t;
		},
		
		removeTask: function(id) {
			delete this.tasks[id];
		},
		
		getTasks: function() {
			return this.tasks;
		},
		
		getTask: function(id) {
			return this.tasks[id];
		},
		
		getPathTo: function(element) {
			if (element.id!=='')
				return "//*[@id='"+element.id+"']";
			
			if (element===document.body)
				return element.tagName.toLowerCase();

			var ix= 0;
			var siblings= element.parentNode.childNodes;
			for (var i= 0; i<siblings.length; i++) {
				var sibling= siblings[i];
				
				if (sibling===element) return this.getPathTo(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
				
				if (sibling.nodeType===1 && sibling.tagName === element.tagName) {
					ix++;
				}
			}
		},
		
		getPageXY: function(element) {
			var x= 0, y= 0;
			while (element) {
				x+= element.offsetLeft;
				y+= element.offsetTop;
				element= element.offsetParent;
			}
			return [x, y];
		},
		
		injectSelector: function(x) {
			var iframe = document.getElementById(x);
			var iWindow = iframe.contentDocument || iframe.contentWindow.document;
			console.log('injectSelector:'+iWindow);
			// --disable-web-security --user-data-dir --allow-file-access-from-files
			this._listenerClick = iWindow.addEventListener('click', function(event) {
				if (event === undefined) event = window.event; // IE hack
				var target = 'target' in event ? event.target : event.srcElement; // another IE hack
				
				console.log('click:'+target);

				var root = document.compatMode === 'CSS1Compat' ? document.documentElement : document.body;
				var mxy = [event.clientX + root.scrollLeft, event.clientY + root.scrollTop];

				Manager.path = Manager.getPathTo(target);
				var txy = Manager.getPageXY(target);
				var message = 'clicked the element ' + Manager.path + ' at offset ' + (mxy[0] - txy[0]) + ', ' + (mxy[1] - txy[1]);
				//document.getElementById("message").innerText = message;
				console.log(message);
				if(!target.style.border||target.style.border=='')
					target.style.border = '5px solid red';
				else
					target.style.removeProperty('border');
				event.preventDefault();
			});
			
			/*this._listenerMouseOver = iWindow.addEventListener('mouseover',function(event){
				if (event === undefined) event = window.event; // IE hack
				if (!event) return;
				var target = 'target' in event ? event.target : event.srcElement; // another IE hack
				target.style.backgroundColor = "yellow";
				target.style.border = '1px solid red';
			});
			
			this._listenerMouseOut = iWindow.addEventListener('mouseout',function(){
				if (event === undefined) event = window.event; // IE hack
				if (!event) return;
				var target = 'target' in event ? event.target : event.srcElement; // another IE hack
				target.style.removeProperty('backgroundColor');
				target.style.removeProperty('border');
			});*/
		},
		
		uninjectSelector: function() {
			removeEventListener(this._listenerClick);
		}
	};
	return Manager;
})();