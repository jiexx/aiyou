//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"log"
	"os/exec"
	"encoding/json"
	"net/http"
	"reflect"
	"fmt"
	"bytes"
	"strings"
	"DB"
)

type user struct {
	tasks map[string]task
	settings string
	id string
}

func (this *user) getTask(tid string) task {
	return tasks[tid]
}

func (this *user) getDB() DB {
	return DB.get(this.id)
}

func (this *user) save(t task) bool {
	this.tasks[t.id] = t
	for _, p := range t.pages {
		p.setOwnerUser(this.id)
		p.setOwnerTask(t.id)
	}
	for _, s := range t.shadows {
		s.setOwnerUser(this.id)
		s.setOwnerTask(t.id)
	}
	return DB.get(this.id).save(this)
}

