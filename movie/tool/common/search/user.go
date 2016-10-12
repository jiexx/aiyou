//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
)

type user struct {
	tasks map[string]*task
	settings string
	id string
}

func (this *user) getTask(tid string) *task {
	return tasks[tid]
}

func (this *user) getUDB() *UDB {
	return UDB.get(this.id)
}

func (this *user) save(t *task) bool {
	this.tasks[t.id] = t
	for _, p := range t.pages {
		p.setOwnerUser(this.id)
		p.setOwnerTask(t.id)
	}
	for _, s := range t.shadows {
		s.setOwnerUser(this.id)
		s.setOwnerTask(t.id)
	}
	return UDB.saveTask(this.id, this)
}

