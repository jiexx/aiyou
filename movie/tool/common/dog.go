//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef
package main

import (
	//"log"

	"encoding/json"
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

func decode(w http.ResponseWriter, r *http.Request, out interface{}) bool {
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(out)
	if err != nil {
		response(w, "failed.")
		return false
	}
	defer r.Body.Close()
	return true
}

func qryReturn(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		mgr := search.GetManager()
		response(w, mgr.Recv(fmt.Sprint(r.Body)))
	}
}

type capcha struct {
	Usermobile string `json:"um"`
}

func userCaptcha(w http.ResponseWriter, r *http.Request) {
	//um := r.URL.Query().Get("um")
	var cap capcha
	if r.Method == "POST" && decode(w, r, &cap) {
		mgr := search.GetManager()
		response(w, mgr.CAPTCHA(cap.Usermobile))
	}
}

type registery struct {
	Usermobile string `json:"um"`
	Pwd        string `json:"pwd"`
	Capcha     string `json:"cap"`
}

func userRegister(w http.ResponseWriter, r *http.Request) {
	var reg registery
	if r.Method == "POST" && decode(w, r, &reg) {
		mgr := search.GetManager()
		response(w, mgr.Register(reg.Usermobile, reg.Pwd, reg.Capcha))
	}
}

type login struct {
	Userid string `json:"uid"`
}

func userLogin(w http.ResponseWriter, r *http.Request) {
	var log login
	if r.Method == "POST" && decode(w, r, &log) {
		mgr := search.GetManager()
		response(w, mgr.Login(log.Userid))
	}
}

type pwdlogin struct {
	Usermobile string `json:"um"`
	Pwd        string `json:"pwd"`
}

func userPwdLogin(w http.ResponseWriter, r *http.Request) {
	var log pwdlogin
	if r.Method == "POST" && decode(w, r, &log) {
		mgr := search.GetManager()
		response(w, mgr.Pwdlogin(log.Usermobile, log.Pwd))
	}
}

func userTasks(w http.ResponseWriter, r *http.Request) {
	var log login
	if r.Method == "POST" && decode(w, r, &log) {
		mgr := search.GetManager()
		response(w, mgr.GetUserTasks(log.Userid))
	}
}
func userSettings(w http.ResponseWriter, r *http.Request) {
	var log login
	if r.Method == "POST" && decode(w, r, &log) {
		mgr := search.GetManager()
		response(w, mgr.GetUserSettings(log.Userid))
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

type taskstart struct {
	Taskid string `json:"tid"`
	Userid string `json:"uid"`
}

func taskStart(w http.ResponseWriter, r *http.Request) {
	var ts taskstart
	if r.Method == "GET" && decode(w, r, &ts) {
		mgr := search.GetManager()
		response(w, mgr.Start(ts.Userid, ts.Taskid))
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
		mux.Handle("/", http.FileServer(http.Dir("./html")))

		mux.Handle("/lib/", http.StripPrefix("/lib/", http.FileServer(http.Dir("./lib"))))
		fmt.Println(http.ListenAndServe(cfg.GetManager().Iport, mux))
		fmt.Println("Running " + cfg.GetManager().Iport)
	} else {
		fmt.Println("go run dog.go --querior[--master] conf.json")
	}
}
