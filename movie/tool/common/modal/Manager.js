(function() {
	var Manager =  {
		tasks:{},
		
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
		}
	};
	return Manager;
})();