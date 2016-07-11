package main

import (
	"log"
	"os/exec"
	"encoding/json"
	"net/http"
	"reflect"
)

type Selector struct {
	expr string;			//css selector
	prefix string;			//maybe attributes
	attr string;			//maybe href(prefix=attributes)/height/text
}
func (s Selector) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
		"expr": s.expr,  
        "prefix": s.prefix,  
        "attr": s.attr,  
    })  
} 
type Args struct {
	url string;
	selector Selector;
}
func (a Args) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
		"url": a.url,  
        "selector": a.selector,  
    })  
} 

func Query(w http.ResponseWriter, r *http.Request) {
	result := false;
	var order_req OrderRequest;
	if r.Method == "GET" {
		jsonDataFromHttp := reflect.ValueOf(r.URL.Query()).MapKeys();
		str := fmt.Sprint(jsonDataFromHttp[0]);
		cmd := exec.Command("casperjs Querier.js", str)
		out, _ := cmd.StdoutPipe();
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
			if err != nil {
				log.Printf("process done with error = %v", err)
			} else {
				log.Print("process done gracefully without error")
			}
		}
	}
	w.Header().Set("Access-Control-Allow-Origin", "*");
	if result == true {
		js, _ := json.Marshal(OrderResponse{Result:result, Order_id:fmt.Sprint(global_id), Clazz:order_req.Clazz, Price:order_req.Price, Amount:order_req.Amount});	
		w.Write([]byte(js));
	}else {
		js, _ := json.Marshal(OrderResponse{Result:result, Order_id:"0", Clazz:order_req.Clazz, Price:order_req.Price, Amount:order_req.Amount});
		w.Write([]byte(js));
	}
	
}

var mux = http.NewServeMux();
func main() {
	mux := http.NewServeMux();
 	mux.HandleFunc("/query", Query);
	http.ListenAndServe(":8081", mux);  
}