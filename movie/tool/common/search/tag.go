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
)

type tag struct {
	expr string
	repeated bool
	trace page
	property string
	id string
	result string
}

func (this *tag) String() string {
	var buffer bytes.Buffer
	buffer.WriteString("{id:'")
	buffer.WriteString(this.id)
	buffer.WriteString("',expr:'")
	buffer.WriteString(this.expr)
	buffer.WriteString("',repeated:'")
	buffer.WriteString(this.repeated)
	buffer.WriteString("',property:")
	buffer.WriteString(this.property)
	buffer.WriteString("'}")
	
	return buffer.String()
}

func (this *tag) getTrace() page {
	return this.trace
}

func (this *tag) trace(db) page[] {
	if this.trace {
		p := this.trace.createDataTraced(db)
		if !p {
			p = this.trace.createTagTraced(this.result)
		}
		return p
	}
}
