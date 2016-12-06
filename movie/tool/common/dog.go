//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef
package main

import (
	//"log"

	"os"
	"path/filepath"
	//"os/exec"
	//"encoding/json"
	"net/http"
	//"reflect"
	"fmt"
	//"strings"
	"io/ioutil"

	"./search"
)

func response(w http.ResponseWriter, result string) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if result == "failed." {
		w.Write([]byte("{err:1}"))
	} else {
		str := fmt.Sprintf("{err:0, result:%s}", result)
		w.Write([]byte(str))
	}
}

func qryReturn(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		mgr := search.GetManager()
		response(w, mgr.Recv(fmt.Sprint(r.Body)))
	}
}

func userCaptcha(w http.ResponseWriter, r *http.Request) {
	um := r.URL.Query().Get("um")
	if r.Method == "GET" && um != "" {
		mgr := search.GetManager()
		response(w, mgr.CAPTCHA(um))
	}
}
func userRegister(w http.ResponseWriter, r *http.Request) {
	um := r.URL.Query().Get("um")
	pwd := r.URL.Query().Get("pwd")
	captcha := r.URL.Query().Get("cap")
	if r.Method == "GET" && um != "" && pwd != "" && captcha != "" {
		mgr := search.GetManager()
		response(w, mgr.Register(um, pwd, captcha))
	}
}
func userLogin(w http.ResponseWriter, r *http.Request) {
	userid := r.URL.Query().Get("uid")
	if r.Method == "GET" && userid != "" {
		mgr := search.GetManager()
		response(w, mgr.Login(userid))
	}
}
func userPwdLogin(w http.ResponseWriter, r *http.Request) {
	um := r.URL.Query().Get("um")
	pwd := r.URL.Query().Get("pwd")
	if r.Method == "GET" && um != "" && pwd != "" {
		mgr := search.GetManager()
		response(w, mgr.Pwdlogin(um, pwd))
	}
}
func userTasks(w http.ResponseWriter, r *http.Request) {
	uid := r.URL.Query().Get("uid")
	if r.Method == "GET" && uid != "" {
		mgr := search.GetManager()
		response(w, mgr.GetUserTasks(uid))
	}
}
func userSettings(w http.ResponseWriter, r *http.Request) {
	uid := r.URL.Query().Get("uid")
	if r.Method == "GET" && uid != "" {
		mgr := search.GetManager()
		response(w, mgr.GetUserSettings(uid))
	}
}
func userSettingsSave(w http.ResponseWriter, r *http.Request) {
	htmlData, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response(w, "failed.")
	}
	if r.Method == "POST" && htmlData != nil {
		mgr := search.GetManager()
		response(w, mgr.SaveUserSettings(string(htmlData)))
	}
}
func taskSave(w http.ResponseWriter, r *http.Request) {
	htmlData, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response(w, "failed.")
	}
	if r.Method == "POST" {
		mgr := search.GetManager()
		response(w, mgr.Save(string(htmlData)))
	}
}
func taskStart(w http.ResponseWriter, r *http.Request) {
	tid := r.URL.Query().Get("tid")
	uid := r.URL.Query().Get("uid")
	if r.Method == "GET" && tid != "" && uid != "" {
		mgr := search.GetManager()
		response(w, mgr.Start(uid, tid))
	}
}

func main() {
	if len(os.Args) != 3 {
		fmt.Println("go run dog.go --querior[--master] conf.json")
		return
	}
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		fmt.Println("conf.json path error.")
		return
	}
	search.SetConfig(dir + "/" + os.Args[2])
	cfg := search.GetConfig()
	mgr := search.GetManager()
	if cfg == nil || mgr == nil {
		fmt.Println("conf.json path error.")
		return
	}
	mux := http.NewServeMux()
	if os.Args[1] == "--querior" {
		doQuerior()
	} else if os.Args[1] == "--master" {
		mux.HandleFunc("/user/captcha", userCaptcha)
		mux.HandleFunc("/user/register", userRegister)
		mux.HandleFunc("/user/login", userLogin)
		mux.HandleFunc("/user/pwdlogin", userPwdLogin)
		mux.HandleFunc("/user/tasks", userTasks)
		mux.HandleFunc("/user/settings", userSettings)
		mux.HandleFunc("/user/settings/save", userSettingsSave)
		mux.HandleFunc("/task/save", taskSave)
		mux.HandleFunc("/task/start", taskStart)
		mux.HandleFunc(cfg.GetManager().Path, qryReturn)
		//mux.HandleFunc("/task/pause", ConfigUpdate);
		//http.Handle("/", http.FileServer(http.Dir("./html")))
		http.HandleFunc("/static/", func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, r.URL.Path[1:])
		})

		http.Handle("/lib/", http.StripPrefix("/lib/", http.FileServer(http.Dir("./lib"))))
		fmt.Println(http.ListenAndServe(cfg.GetManager().Iport, mux))
		fmt.Println("Running " + cfg.GetManager().Iport)
	} else {
		fmt.Println("go run dog.go --querior[--master] conf.json")
	}
}
