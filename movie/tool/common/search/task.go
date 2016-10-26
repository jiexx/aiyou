//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"strconv"
)

type task struct {
	time string 
	pages []page
	shadows []page
	root page 
	incr bool 
	clock int
	status int  //0 start; 1 editing; 2 complete; 3 play; 4 done; 
	name string 
	id string
	_counter int
}

func (this *task) start(uid string, tid string) {
	this._counter = 0
	this.root.start(uid, tid)
}

func (this *task) stop() {
	this.status = 4
}

func (this *task) down() bool {
	this._counter ++
	return this._counter == len(this.shadows)
}

func (this *task) toArrary() []string {
	var a []string
	a = append(a, this.id)
	a = append(a, this.name)
	a = append(a, "{}")
	return  a
}

