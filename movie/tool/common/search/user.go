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

func (this *user) bind(t *task) {
	var rows [][]string
	
	this.tasks[t.id] = t
	for _, p := range t.pages {
		p.setOwnerUser(this.id)
		p.setOwnerTask(t.id)
	}
	for _, s := range t.shadows {
		s.setOwnerUser(this.id)
		s.setOwnerTask(t.id)
	}
}

func (this *user) get() []string{
	var a []string = []string{"col0", this.id}
	var b []string = []string{"col1"}
	rows := this.getUDB().query(this.id, a, b)
	var result []string
	for k, v := range rows {
		result = append(result, v[0])
	}
	return result
}

func (this *user) save(t *task, js string) bool{
	a := t.toArrary()
	a = append(a[:0], append([]string{this.id},a[0:]...)...)
	a = append(a[:1], append([]string{js},a[1:]...)...)
	return this.getUDB().save(this.id, a)
}

func (this *user) update(t *task, js string) bool{
	if this.delete(t) {
		if this.save(t, js) {
			return true
		}
	}
	return false
}

func (this *user) delete(t *task) bool{
	return this.getUDB().delete(this.id, t.id)
}