//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"log"
	"os/exec"
	"encoding/json"
	"net/http"
	"reflect"
	"fmt"
	"bytes"
	"strings"
	"os"
)

type cfdog struct {
	iport string
}

type cfqrier struct {
	iport string
}

type settings string {
	loadImages bool
	loadPlugins bool
	timeout int
	userAgent string	
	retryTimeout int
	waitTimeout int
}

type config struct {
	dog cfdog
	cfqs []cfqrier
	jdbc string
	titan string
}

var cfg *config = nil
func getConfig() config {
	if !cfg {
		once.Do(func() {
			cfg = &config{};
			file, _ := os.Open("conf.json")
			decoder := json.NewDecoder(file)
			err := decoder.Decode(cfg)
		})
	}
	return cfg
}

func (this *config) dog() cfdog {
	return getConfig().dog
}

func (this *config) qriers() []cfqrier {
	return getConfig().cfqs
}

