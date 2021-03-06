//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef
package main

import (
	"log"
	"os/exec"
	//"encoding/json"
	"net/http"
	//"reflect"
	"bytes"
	"fmt"
	"io/ioutil"
	"time"

	"./search"
)

func post(js string) {
	body := bytes.NewBuffer([]byte(js))
	cfg := search.GetConfig()
	res, err := http.Post(cfg.GetQueriorReturnURL(), "application/json;charset=utf-8", body)
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
	fmt.Printf("%s", result)
}

func doTask(js string) {
	cmd := exec.Command("casperjs Querior.js", js)
	out, _ := cmd.StdoutPipe()
	cmd.Start()
	done := make(chan error, 1)
	go func() {
		done <- cmd.Wait()
	}()
	select {
	case <-time.After(60 * time.Second):
		if err := cmd.Process.Kill(); err != nil {
			log.Fatal("failed to kill: ", err)
		}
		log.Println("process killed as timeout reached")
	case err := <-done:
		if err == nil {
			buf := new(bytes.Buffer)
			buf.ReadFrom(out)
			post(buf.String())
		}
	}
}

func query(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		doTask(fmt.Sprint(r.Body))
		response(w, "ok.")
	}
}

func doQuerior() {
	cfg := search.GetConfig()

	mux := http.NewServeMux()
	mux.HandleFunc(cfg.GetQueriors()[0].Path, query)
	http.ListenAndServe(cfg.GetQueriors()[0].Iport, mux)
}
