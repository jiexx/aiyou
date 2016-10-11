//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"encoding/json"
	"strings"
	"sync"
)



type manager struct {
	users map[string]user
	delegators []delegator
	_this *manager
}

var _mgr *manager = nil
var _mgronce sync.Once
func getManager() manager {
	if !_mgr {
		_mgronce.Do(func() {
			_mgr = &manager{users:make(map[string]user), delegators:make([]delegator)};
		})
	}
	return _mgr
}

func (this *manager) timeoutLog(p page) {
	u := p.getOwnerUser( this.users )
	u.getDB().getTable("Timeout").save(p)
}

func (this *page) successLog(p page) {
	if p.isVisited() {
		u := p.getOwnerUser( this.users )
		t := p.getOwnerTask( u.tasks )
		u.getDB().getTable(t.name).save(p)
	}
}

func (this *manager) Start(uid string, tid string) bool {
	u := this.users[uid]
	if u {
		t := u.getTask(tid)
		if t {
			t.start(uid, tid)
			this.handle(&t.root)
		}
	}
}

type User struct {
	Task task
	Uid string
}

func (this *manager) Save(js string) bool {
	decoder := json.NewDecoder(js)
    var u User  
	u = nil
    err := decoder.Decode(&u)
    if err != nil {
        panic()
    }
	if u && len(u.Uid) > 0 && strings.Contains(u.Task.id, "TSK")  {
		if u.save(u.Task) {
			this.users[u.Uid] = u
			return true
		}
	}
	return false
}

func (this *manager) Recv(js string) bool {
	decoder := json.NewDecoder(js)
    var p page  
    err := decoder.Decode(&p)
    if err != nil {
        panic()
    }
	if !strings.Contains(p.id, "PAG") {
		this.handle(p)
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
		if d {
			this.successLog(p)   // the page querier returned
			d.free()
		}
		c_msg <- p
		for _, tag := range p.tags {
			if tag.hasTrace() {
				u := p.getOwnerUser( this.users )
				tps := tag.trace(u.getDB())
				if len(tps) == 0 {
					t := p.getOwnerTask( u.tasks )
					t.stop()
				}
				for _, tp := range tps {
					c_msg <- tp
				}
			}
		}
	}()
}

func (this *manager) postPageToQuerier(p) {
	for i, d := range this.delegators {
		if(!d.isBusy()){
			p.setDelegator(i)
			d.post(p); //d busy
		}
	}
}

func (this *manager) loop() {
	go func() {
		for {
			page := <-c_msg
			postPageToQuerier(p);
		}
	}()
}
