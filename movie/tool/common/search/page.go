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
	"regexp"
	"crypto/md5"
	"DB"
)

type page struct {
	name string
	url string
	isShadow bool
	tags []tag
	id string
	_didx int
	_userid string
	_taskid string
	_visitid string
}

func (this *page) setIdVisited() {
	var buffer bytes.Buffer
	buffer.WriteString(time.Now().Unix())
	buffer.WriteString(this.url)
	this._visitid = md5.Sum(buffer.String())
}

func (this *page) isVisited() {
	return this._visitid != -1 && this._didx > -1
}

func (this *page) setDelegator(did string) {
	this._didx = uid
}

func (this *page) getDelegator(delegators []delegator) delegator {
	return delegators[this._didx]
}

func (this *page) setOwnerTask(tid string) {
	this._taskid = tid
}

func (this *page) getOwnerTask(tasks map[string]task) task {
	return tasks[this._taskid]
}

func (this *page) setOwnerUser(uid string) {
	this._userid = uid
}

func (this *page) getOwnerUser(users map[string]user) user {
	return users[this._userid]
}

func (this *page) start(uid string, tid string) {
	this._userid = uid
	this._taskid = tid
	this._didx = -1
	this._visitid = -1
}

func (this *page) createDataTraced(db DB) []page {
	var pages []page
	re := regexp.MustCompile("\[([^\.|\b]+)\.([^\]|\b]+)\]")  // Result Table Named by Task
	re.MatchString(this.url)
	if this.isShadow && len(re.SubexpNames()) == 2 && strings.Contains(this.url, "%s") {
		for _, result := range db.get( re.SubexpNames()[0], re.SubexpNames()[1]) {
			p := page{url:fmt.Sprint(this.url, result), name:this.name, tags:this.tags, id:this.id}
			p.start(this._userid, this._taskid)
			pages = append(pages, p)  
		}
	}
	return pages
}

func (this *page) createTagTraced(result) []page {
	var pages []page
	if this.isShadow && strings.Contains(this.url, "%s") && len(result) > 0 {
		p := page{url:fmt.Sprint(this.url, result), name:this.name, tags:this.tags, id:this.id}
		p.start(this._userid, this._taskid)
		pages = append(pages, p)  
	}
	return pages
}

func (this *page) String() string {
	var buffer bytes.Buffer
	buffer.WriteString("{id:'")
	buffer.WriteString(this.id)
	buffer.WriteString("',name:'")
	buffer.WriteString(this.name)
	buffer.WriteString("',url:'")
	buffer.WriteString(this.url)
	buffer.WriteString("',tags:[")
	for _, tag := range this.tags {
		buffer.WriteString(tag)
		buffer.WriteString(",")
	}
	buffer.WriteString("]},")
	buffer.WriteString("',_didx:'")
	buffer.WriteString(this._didx)
	buffer.WriteString("',_userid:'")
	buffer.WriteString(this._userid)
	buffer.WriteString("',_taskid:'")
	buffer.WriteString(this._taskid)
	buffer.WriteString("'}")
	return buffer.String()
}
