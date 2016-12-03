//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef
package search

import (
	"bytes"
	"crypto/md5"
	"encoding/json"
	"strconv"
	"strings"
	"sync"
	"time"
)

type manager struct {
	captchas   map[string]string
	users      map[string]user
	delegators []delegator
	c_msg      chan page
	_this      *manager
}

var _mgr *manager = nil
var _mgronce sync.Once

func GetManager() *manager {
	if _mgr == nil {
		_mgronce.Do(func() {
			_mgr = &manager{users: make(map[string]user), c_msg: make(chan page)}
			_mgr.createDelegatorsByConf()
			_mgr._this = _mgr
		})
	}
	return _mgr
}

func (this *manager) createDelegatorsByConf() {
	cfg := GetConfig()
	queriors := cfg.GetQueriors()
	for _, q := range queriors {
		this.delegators = append(this.delegators, delegator{urlAddr: q.getPostQueriorURL(), status: 0})
	}
}

func (this *manager) CAPTCHA(usermobile string) string {
	udb := UDB{}.get("DOG_USERS")
	var a []string = []string{"col1", usermobile}
	var b []string = []string{"col0"}
	rows := udb.query("USERS", a, b)
	if len(rows) == 0 {
		var buffer bytes.Buffer
		var hashChannel = make(chan []byte, 1)
		buffer.WriteString(strconv.FormatInt(time.Now().Unix(), 10))
		buffer.WriteString(usermobile)
		sum := md5.Sum(buffer.Bytes())
		hashChannel <- sum[:]
		userid := "USR" + string(<-hashChannel)
		captcha := userid[3:4]
		this.captchas[captcha] = userid
		return captcha
	}
	return "failed."
}

func (this *manager) Register(usermobile string, pwd string, captcha string) string {
	userid, ok := this.captchas[captcha]
	if ok {
		udb := UDB{}.get("DOG_USERS")
		var a []string = []string{userid, usermobile, pwd}
		if udb.save("USERS", a) {
			return userid
		}
	}
	return "failed."
}

func (this *manager) GetUserTasks(uid string) string {
	//u := user{id:uid}
	usr, ok := this.users[uid]
	if ok {
		jss := usr.getTasks()
		var buffer bytes.Buffer
		buffer.WriteString("[")
		for _, js := range jss {
			var ut UserTask
			buffer.WriteString(js + ",")
			err := json.Unmarshal([]byte(js), &ut)
			if err != nil {
				panic("manager Login")
			}
			usr.bind(&ut.Task)
		}
		//this.users[uid] = u
		buffer.WriteString("]")
		return buffer.String()
	}
	return "failed."
}

func (this *manager) GetUserSettings(uid string) string {
	usr, ok := this.users[uid]
	if ok {
		return usr.getSettings()
	}
	return "failed."
}

type UserSettings struct {
	uid string
	js  string
}

func (this *manager) SaveUserSettings(js string) string {
	var us UserSettings
	err := json.Unmarshal([]byte(js), &us)
	if err != nil {
		//panic("manager Save")
		return "failed."
	}
	usr, ok := this.users[us.uid]
	if ok {
		if usr.saveSettings(us.js) {
			return "ok."
		}
	}
	return "failed."
}

func (this *manager) Pwdlogin(usermobile string, pwd string) string {
	udb := UDB{}.get("DOG_USERS")
	var a []string = []string{"col1", usermobile, "col2", pwd}
	var b []string = []string{"col0"}
	rows := udb.query("USERS", a, b)
	if len(rows) > 0 {
		userid := rows[0][0]
		this.users[userid] = user{id: userid}
		return userid //this.getUserTasks(rows[0][0])
	}
	return "failed."
}

func (this *manager) Login(userid string) string {
	udb := UDB{}.get("DOG_USERS")
	var a []string = []string{"col0", userid}
	var b []string = []string{"col0"}
	rows := udb.query("USERS", a, b)
	if len(rows) > 0 {
		this.users[userid] = user{id: userid}
		return userid //this.getUserTasks(rows[0][0])
	}
	return "failed."
}

func (this *manager) timeoutLog(p page) {
	p.timeoutSave(this.users)
}

func (this *manager) successLog(p page) {
	if p.isVisited() {
		//u := p.getOwnerUser( this.users )
		//t := p.getOwnerTask( u.tasks )
		//u.getUDB().savePage(t.name, p)
		p.save(this.users)
	}
}

func (this *manager) Start(uid string, tid string) string {
	u, ok := this.users[uid]
	if ok {
		t := u.getTask(tid)
		if t != nil {
			t.start(uid, tid)
			this.handle(&t.root)
			return "ok."
		}
	}
	return "failed."
}

type UserTask struct {
	Task task
	Uid  string
}

func (this *manager) Save(js string) string {
	var ut UserTask
	err := json.Unmarshal([]byte(js), &ut)
	if err != nil {
		//panic("manager Save")
		return "failed."
	}
	if len(ut.Uid) > 0 && strings.Contains(ut.Task.id, "TSK") {
		u := user{id: ut.Uid}
		u.bind(&ut.Task)
		if u.updateTask(ut.Task.id, js) {
			this.users[ut.Uid] = u
			return "ok."
		}
	}
	return "failed."
}

func (this *manager) Delete(js string) string {
	var ut UserTask
	err := json.Unmarshal([]byte(js), &ut)
	if err != nil {
		panic("manager Update")
	}
	if len(ut.Uid) > 0 && strings.Contains(ut.Task.id, "TSK") {
		u := user{id: ut.Uid}
		u.bind(&ut.Task)
		this.users[ut.Uid] = u
		if u.delTask(ut.Task.id) {
			return "ok."
		}
	}
	return "failed."
}

func (this *manager) Recv(js string) string {
	var p page
	err := json.Unmarshal([]byte(js), &p)
	if err != nil {
		panic("manager Recv")
	}
	if !strings.Contains(p.id, "PAG") {
		this.handle(&p)
		return "ok."
	}
	return "failed."
}

func (this *manager) handle(p *page) {
	go func() {
		if !strings.Contains(p.id, "PAG") {
			return
		}
		d := p.getDelegator(this.delegators)
		if d != nil {
			this.successLog(*p) // the page querier returned
			d.free()
		}
		this.c_msg <- *p
		for _, tag := range p.tags {
			if tag.hasTrace() {
				u := p.getOwnerUser(this.users)
				tps := tag.createTrace(&u)
				if len(tps) == 0 {
					t := p.getOwnerTask(u.tasks)
					t.stop()
				}
				for _, tp := range tps {
					this.c_msg <- tp
				}
			}
		}
	}()
}

func (this *manager) postPageToQuerier(p page) {
	for i, d := range this.delegators {
		if !d.isBusy() {
			u := p.getOwnerUser(this.users)
			conf := u.getSettings()
			p.setDelegator(i) //strconv.Itoa(i))
			d.post(conf, p)   //d busy
		}
	}
}

func (this *manager) loop() {
	go func() {
		for {
			p := <-this.c_msg
			this.postPageToQuerier(p)
		}
	}()
}
