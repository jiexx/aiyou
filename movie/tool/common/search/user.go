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
	return this.tasks[tid]
}

func (this *user) getUDB() *UDB {
	return UDB{}.get(this.id)
}

func (this *user) bind(t *task) bool {
	var rows [][]string
	var a []string
	
	this.tasks[t.id] = t
	for _, p := range t.pages {
		p.setOwnerUser(this.id)
		p.setOwnerTask(t.id)
		rows := append(rows, []string{t.id, p.id})		
	}
	for _, s := range t.shadows {
		s.setOwnerUser(this.id)
		s.setOwnerTask(t.id)
	}
	
	if !this.getUDB().saves("TSK_PAG_"+this.id[3:len(this.id)], rows) {
		return false
	}
	a = append(a, js)
	return this.getUDB().save(t.id, a)
}

func (this *user) update(t *task, js string) bool{
	a := t.toArrary()
	a = append(a, js)
	return this.getUDB().update(t.id, t.id, a)
}

func (this *user) delete(t *task) bool{
	return this.getUDB().delete(t.id, t.id)
}