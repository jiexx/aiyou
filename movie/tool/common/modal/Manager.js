(function() {
	var Manager =  {
		tasks:[],
		
		newTask: function(name) {  //web op
			var t = Task.create(name);
			this.tasks.push(t);
			return t;
		},
		
		removeTask: function(index) {
			this.tasks.splice(index,1);
		},
		
		getTasks: function() {
			return this.tasks;
		},
		
		getTask: function(index) {
			return this.tasks[index];
		}
	};
	return Manager;
})();