//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"encoding/json"
	"strings"
	"sync"
	"crypto/md5"
	"time"
	"strconv"
	"bytes"
)



type manager struct {
	captchas map[string]string
	users map[string]user
	delegators []delegator
	c_msg chan page
	_this *manager
}

var _mgr *manager = nil
var _mgronce sync.Once
func getManager() *manager {
	if _mgr == nil {
		_mgronce.Do(func() {
			_mgr = &manager{users:make(map[string]user), c_msg:make(chan page)};
			_mgr._this = _mgr
		})
	}
	return _mgr
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
		userid := "USR"+string(<-hashChannel)
		this.captchas[userid] = userid[3:4]
		return this.captchas[userid]
	}
	return ""
}

func (this *manager) Register(usermobile string, pwd string, captcha string, userid string) bool {
	if this.captchas[userid] == captcha  {
		udb := UDB{}.get("DOG_USERS")
		var a []string = []string{userid, usermobile, pwd}
		return udb.save("USERS", a)
	}
	return false
}

func (this *manager) getUserTasks(uid string) []string {
	u := user{id:uid}
	jss := u.getTasks()
	for _, js := range jss {
		var uu User  
		err := json.Unmarshal([]byte(js), &uu)
		if err != nil {
			panic("manager Login")
		}
		u.bind(&uu.Task)
	}
	this.users[uid] = u
	return jss
}

func (this *manager) Pwdlogin(usermobile string, pwd string) []string {
	udb := UDB{}.get("DOG_USERS")
	var a []string = []string{"col1", usermobile, "col2", pwd}
	var b []string = []string{"col0"}
	rows := udb.query("USERS", a, b)
	if len(rows) > 0  {
		return this.getUserTasks(rows[0][0])
	}
	return nil
}

func (this *manager) Login(userid string) []string {
	udb := UDB{}.get("DOG_USERS")
	var a []string = []string{"col0", userid}
	var b []string = []string{"col0"}
	rows := udb.query("USERS", a, b)
	if len(rows) > 0  {
		return this.getUserTasks(rows[0][0])
	}
	return nil
}

func (this *manager) timeoutLog(p page) {
	p.timeoutSave( this.users )
}

func (this *manager) successLog(p page) {
	if p.isVisited() {
		//u := p.getOwnerUser( this.users )
		//t := p.getOwnerTask( u.tasks )
		//u.getUDB().savePage(t.name, p)
		p.save( this.users )
	}
}

func (this *manager) Start(uid string, tid string) bool {
	u, ok := this.users[uid]
	if ok {
		t := u.getTask(tid)
		if t != nil {
			t.start(uid, tid)
			this.handle(&t.root)
			return true
		}
	}
	return false
}

type User struct {
	Task task
	Uid string
}
func (this *manager) Save(js string) bool {
	var uu User  
	err := json.Unmarshal([]byte(js), &uu)
    if err != nil {
        panic("manager Save")
    }
	if len(uu.Uid) > 0 && strings.Contains(uu.Task.id, "TSK")  {
		u := user{id:uu.Uid}
		u.bind(&uu.Task)
		if u.updateTask(uu.Task.id, js) {
			this.users[uu.Uid] = u
			return true
		}
	}
	return false
}

func (this *manager) Delete(js string) bool {
	var uu User  
	err := json.Unmarshal([]byte(js), &uu)
    if err != nil {
        panic("manager Update")
    }
	if len(uu.Uid) > 0 && strings.Contains(uu.Task.id, "TSK")  {
		u := user{id:uu.Uid}
		u.bind(&uu.Task)
		this.users[uu.Uid] = u
		return u.delTask(uu.Task.id)
	}
	return false
}

func (this *manager) Recv(js string) bool {
	var p page  
	err := json.Unmarshal([]byte(js), &p)
    if err != nil {
        panic("manager Recv")
    }
	if !strings.Contains(p.id, "PAG") {
		this.handle(&p)
		return true
	}
	return false	
}

func (this *manager) handle(p *page) {
	go func() {
		if !strings.Contains(p.id, "PAG") {
			return
		}
		d := p.getDelegator(this.delegators)
		if d != nil {
			this.successLog(*p)   // the page querier returned
			d.free()
		}
		this.c_msg <- *p
		for _, tag := range p.tags {
			if tag.hasTrace() {
				u := p.getOwnerUser( this.users )
				tps := tag.createTrace(&u)
				if len(tps) == 0 {
					t := p.getOwnerTask( u.tasks )
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
		if(!d.isBusy()){
			p.setDelegator(i)//strconv.Itoa(i))
			d.post(p); //d busy
		}
	}
}

func (this *manager) loop() {
	go func() {
		for {
			p := <-this.c_msg
			this.postPageToQuerier(p);
		}
	}()
}
