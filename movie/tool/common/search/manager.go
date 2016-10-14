//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"encoding/json"
	"strings"
	"sync"
	//"strconv"
)



type manager struct {
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

func (this *manager) timeoutLog(p page) {
	u := p.getOwnerUser( this.users )
	u.getUDB().save("Timeout", p)
}

func (this *manager) successLog(p page) {
	if p.isVisited() {
		u := p.getOwnerUser( this.users )
		t := p.getOwnerTask( u.tasks )
		u.getUDB().save(t.name, p)
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
		u := user{}
		if u.save(&uu.Task) {
			this.users[uu.Uid] = u
			return true
		}
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
				tps := tag.createTrace(u.getUDB())
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
