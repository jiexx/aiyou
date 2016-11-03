//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
)

type user struct {
	tasks map[string]*task
	conf settings
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

func (this *user) getTasks() []string{
	var a []string = []string{"col0", this.id}
	var b []string = []string{"col1"}
	rows := this.getUDB().query(this.id, a, b)
	var result []string
	for k, v := range rows {
		result = append(result, v[0])
	}
	return result
}
func (this *user) saveTask(taskid string, js string) bool{
	return this.getUDB().save("USR_TASKS", []string{taskid,js})
}
func (this *user) delTask(taskid string) bool{
	return this.getUDB().delete("USR_TASKS", t.id)
}
func (this *user) updateTask(taskid string, js string) bool{
	if this.delTask(taskid) {
		if this.saveTask(taskid, js) {
			return true
		}
	}
	return false
}
func (this *user) getConfig() []string{
	var a []string = []string{"col0", this.id}
	var b []string = []string{"col1"}
	rows := this.getUDB().query(this.id, a, b)
	var result []string
	for k, v := range rows {
		result = append(result, v[0])
	}
	return result
}
func (this *user) saveConfig(taskid string, js string) bool{
	return this.getUDB().save("USR_CONF", []string{taskid,js})
}
func (this *user) delConfig(taskid string) bool{
	return this.getUDB().delete("USR_CONF", t.id)
}
func (this *user) updateConfig(taskid string, js string) bool{
	if this.delConfig(taskid) {
		if this.saveConfig(taskid, js) {
			return true
		}
	}
	return false
}