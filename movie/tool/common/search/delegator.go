//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef
package search

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
	"time"
)

type delegator struct {
	status  int // 0 free 1 busy
	urlAddr string
	mux     sync.Mutex
	timer   *time.Timer
}

func (this *delegator) isBusy() bool {
	return this.status == 1
}

func (this *delegator) startTimer(p page) {
	this.timer = time.NewTimer(10 * time.Second)
	go func() {
		<-this.timer.C
		this.timer.Stop()
		this.free()
		GetManager().timeoutLog(p)
		fmt.Println("Timer has expired.")
	}()
}

func (this *delegator) post(conf string, p page) {
	this.mux.Lock()
	this.startTimer(p)
	this.status = 1
	body := bytes.NewBuffer([]byte("{conf:" + conf + ",page:" + p.String() + "}"))
	res, err := http.Post(this.urlAddr, "application/json;charset=utf-8", body)
	if err != nil {
		log.Fatal(err)
		return
	}
	result, err := ioutil.ReadAll(res.Body)
	res.Body.Close()
	if err != nil {
		log.Fatal(err)
		return
	}
	p.setIdVisited()
	fmt.Printf("%s", result)
}

func (this *delegator) free() {
	this.status = 0
	this.mux.Unlock()
}
