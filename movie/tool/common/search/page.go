//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"fmt"
	"bytes"
	"strings"
	"regexp"
	"crypto/md5"
	"time"
	"strconv"
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
	var hashChannel = make(chan []byte, 1)
	buffer.WriteString(strconv.FormatInt(time.Now().Unix(), 10))
	buffer.WriteString(this.url)
	sum := md5.Sum(buffer.Bytes())
	hashChannel <- sum[:]
	this._visitid = string(<-hashChannel)
}

func (this *page) isVisited() bool {
	return this._visitid != "" && this._didx > -1
}

func (this *page) setDelegator(did int) {
	this._didx = did
}

func (this *page) getDelegator(delegators []delegator) *delegator {
	if this._didx > 0 && this._didx > len(delegators){
		return nil
	}
	return &delegators[this._didx]
}

func (this *page) setOwnerTask(tid string) {
	this._taskid = tid
}

func (this *page) getOwnerTask(tasks map[string]*task) *task {
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
	this._visitid = ""
}

func (this *page) createDataTraced(u *user) []page {
	var pages []page
	re := regexp.MustCompile(`\[([^\.|\b]+)\.([^\]|\b]+)\]`)  // Result Table Named by Task, eg. www.web.com/[结果表.col1]
	re.MatchString(this.url)
	if this.isShadow && len(re.SubexpNames()) == 2 && strings.Contains(this.url, "%s") {
		rows := u.getResults(re.SubexpNames()[0], re.SubexpNames()[1])
		for _, result := range rows {
			p := page{url:fmt.Sprint(this.url, result), name:this.name, tags:this.tags, id:this.id}
			p.start(this._userid, this._taskid)
			pages = append(pages, p)  
		}
	}
	return pages
}

func (this *page) createTagTraced(result string) []page {
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
		buffer.WriteString(tag.String())
		buffer.WriteString(",")
	}
	buffer.WriteString("]},")
	buffer.WriteString("',_didx:'")
	buffer.WriteString(strconv.Itoa(this._didx))
	buffer.WriteString("',_userid:'")
	buffer.WriteString(this._userid)
	buffer.WriteString("',_taskid:'")
	buffer.WriteString(this._taskid)
	buffer.WriteString("'}")
	return buffer.String()
}

func (this *page) toArrary() []string {
	var a []string
	a = append(a, this.id)
	a = append(a, this._taskid)
	a = append(a, this.name)
	a = append(a, this.url)
	for _, tag := range this.tags {
		a = append(a, tag.result)
	}
	return  a
}

func (this *page) save(users map[string]user) {
	u := this.getOwnerUser( users )
	u.getUDB().save(this.id, this.toArrary())
}

func (this *page) timeoutSave(users map[string]user) {
	u := this.getOwnerUser( users )
	u.getUDB().save("Timeout", this.toArrary())
}
