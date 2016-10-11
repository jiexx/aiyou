//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package main

import (
	"log"
	"os/exec"
	"encoding/json"
	"net/http"
	"reflect"
	"fmt"
	"./search"
)


func post(js string) {
	body := bytes.NewBuffer([]byte(js)) 
	cfg := getConfig()	
	res,err := http.Post(cfg.dog.iport, "application/json;charset=utf-8", body)  
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
	out, _ := cmd.StdoutPipe();
	cmd.Start()
	done := make(chan error, 1)
	go func() {
		done <- cmd.Wait()
	}()
	select {
	case <-time.After(60 * time.Second):
		if err := cmd.Process.Kill(); err != nil {
			this.status = 0
			log.Fatal("failed to kill: ", err)
		}
		log.Println("process killed as timeout reached")
	case err := <-done:
		if err == nil {
			post(out);
		}
	}
}

response(w http.ResponseWriter, error bool) {
	str := fmt.printf("{err:%b}",error)
	w.Header().Set("Access-Control-Allow-Origin", "*");
	w.Write([]byte(str));
}

func Query(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		doTask(fmt.Sprint(r.Request.Body))
		response(w, true)
	}
}

func main() {
	cfg = getConfig();
	mux := http.NewServeMux();
 	mux.HandleFunc("/", Query);
	http.ListenAndServe(":8061", mux);  
}