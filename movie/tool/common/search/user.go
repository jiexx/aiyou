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
func (this *user) getResults(tabname string, colname string) []string{
	var b []string = []string{colname}
	rows := this.getUDB().query(tabname, nil, b)
	var result []string
	for _, v := range rows {
		result = append(result, v[0])
	}
	return result
}
func (this *user) getTasks() []string{
	var b []string = []string{"col1"}
	rows := this.getUDB().query("USR_TASKS", nil, b)
	var result []string
	for _, v := range rows {
		result = append(result, v[0])
	}
	return result
}
func (this *user) saveTask(taskid string, js string) bool{
	return this.getUDB().save("USR_TASKS", []string{taskid,js})
}
func (this *user) delTask(taskid string) bool{
	return this.getUDB().delete("USR_TASKS", taskid)
}
func (this *user) updateTask(taskid string, js string) bool{
	if this.delTask(taskid) {
		if this.saveTask(taskid, js) {
			return true
		}
	}
	return false
}
func (this *user) getSettings() string{
	if this.settings == nil || len(this.settings) == 0 {
		var b []string = []string{"col1"}
		rows := this.getUDB().query("USR_SETTINGS", nil, b)
		for _, v := range rows {
			this.settings = v //append(result, v[0])
		}
	』
	return this.settings
}
func (this *user) saveSettings(js string) bool{
	return this.getUDB().save("USR_SETTINGS", []string{this.id,js})
}
func (this *user) delSettings() bool{
	return this.getUDB().delete("USR_SETTINGS", this.id)
}
func (this *user) updateSettings(js string) bool{
	if this.delSettings() {
		if this.saveSettings(this.id, js) {
			return true
		}
	}
	return false
}